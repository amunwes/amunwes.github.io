---
layout: posts
title: "RAG: How LLMs Get Access to Your Data"
date: 2027-01-05 09:00:00 -0700
tags: [machine-learning, llm, rag, nlp]
excerpt: "Large language models know a lot — but not your data, not last week's events, and not the specific documents you care about. RAG is the practical solution. Here's how it works."
---

The first time someone asked me why a language model gave a confidently wrong answer, I didn't have a clean explanation. The model's training data has a cutoff. It doesn't know about your internal documents. And it sometimes just confabulates — generates plausible-sounding text that happens to be false. Retrieval Augmented Generation (RAG) doesn't fix all of these problems, but it fixes the most important ones in a surprisingly clean way.

## Why LLMs Hallucinate

A language model is trained to predict the next token given the previous ones. It's very good at generating fluent, coherent text in the style of its training data. What it doesn't have is a pointer to a source of truth. When it doesn't know something, it doesn't say "I don't know" — it generates the most plausible-sounding continuation, which may or may not be correct.

This is especially problematic for:
- **Private data**: your company's docs, your personal notes, your codebase
- **Recent events**: anything after the training cutoff
- **Highly specific facts**: exact statistics, names, dates

Fine-tuning a model on your data partially addresses this, but it's expensive, slow to update, and the model can still "forget" or confuse information learned during fine-tuning. RAG is a different approach.

## The RAG Idea

RAG stands for Retrieval Augmented Generation. The idea is simple: before asking the LLM to answer a question, *retrieve the relevant documents first* and include them in the prompt. The model doesn't need to memorize the answer — it just needs to read it from the context you provide.

The pipeline has three stages:

1. **Index**: preprocess your documents into searchable embeddings and store them
2. **Retrieve**: given a user query, find the most relevant documents
3. **Generate**: pass the retrieved documents + query to the LLM; ask it to answer using them

This separates the "knowing" problem from the "reasoning" problem. The retrieval step handles what to look at; the LLM handles what to say about it.

## Building a Basic RAG Pipeline

Here's a minimal implementation using `sentence-transformers` for retrieval and a simple prompt for generation:

```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Your document store (in practice: a vector database)
documents = [
    "The Q3 revenue was $2.4M, up 12% from Q2.",
    "Our refund policy allows returns within 30 days of purchase.",
    "The API rate limit is 100 requests per minute per user.",
    "CEO Jane Smith joined the company in 2019.",
]

embed_model = SentenceTransformer('all-MiniLM-L6-v2')
doc_embeddings = embed_model.encode(documents)

def retrieve(query, top_k=2):
    q_emb = embed_model.encode([query])
    scores = cosine_similarity(q_emb, doc_embeddings)[0]
    top_idx = np.argsort(scores)[::-1][:top_k]
    return [documents[i] for i in top_idx]

def build_prompt(query, retrieved_docs):
    context = "\n".join(f"- {doc}" for doc in retrieved_docs)
    return f"""Answer the following question using only the provided context.
If the answer isn't in the context, say "I don't have that information."

Context:
{context}

Question: {query}
Answer:"""

query = "What's the refund policy?"
retrieved = retrieve(query)
prompt = build_prompt(query, retrieved)
# Pass `prompt` to your LLM of choice
```

The prompt now contains the relevant documents alongside the question. A capable LLM will use them to answer accurately — and (importantly) *only* them. The instruction "use only the provided context" is the key constraint that reduces hallucination.

## What Makes RAG Work Well

**Chunk size and overlap.** Documents are usually too long to embed whole — a 50-page PDF embedded as a single vector loses most of its granularity. Standard practice is to split documents into overlapping chunks (200–500 tokens, ~50 token overlap). The overlap prevents a relevant sentence from being cut in half at a chunk boundary.

**Embedding quality.** The embedding model is the retrieval bottleneck. A weak embedding model will fail to retrieve the relevant chunk even when it exists. For specialized domains, fine-tuned embedding models (e.g., for legal, medical, or code retrieval) are worth investigating.

**Re-ranking.** A two-stage retrieval approach often works better than a single embedding similarity pass. In stage one, you retrieve a broader set of candidates (say top-20). In stage two, a cross-encoder re-ranks them — cross-encoders attend to both the query and each document simultaneously, which is more accurate but too expensive to run over the whole corpus.

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
candidates = retrieve(query, top_k=20)
scores = reranker.predict([(query, doc) for doc in candidates])
reranked = [candidates[i] for i in np.argsort(scores)[::-1][:3]]
```

**Prompt construction.** How you arrange retrieved documents in the prompt matters. LLMs tend to pay more attention to content at the beginning and end of the context window (the "lost in the middle" problem). Put the most relevant document first or last; don't bury it in the middle of a long context.

## When RAG Is and Isn't the Right Tool

RAG is good when:
- You have a body of documents the model needs to reference
- The information changes frequently (easy to re-index; no re-training)
- You need the model to cite or attribute its answers
- Hallucination on factual questions is a problem

RAG struggles when:
- Answering requires synthesizing information across many documents (retrieval gives you snippets, not a comprehensive view)
- The query is ambiguous or requires iterative clarification
- You need the model to reason about the *absence* of information in a document

For the last case — complex multi-step reasoning over a corpus — you may be looking at agent-based approaches where the model can issue multiple queries, follow chains of thought, and compare retrieved information across steps. But for the large middle ground of "answer questions about this set of documents," RAG is the right architecture.

## The Eval Problem

RAG systems are harder to evaluate than standalone models. You have two failure modes to worry about: retrieval failure (the right document wasn't fetched) and generation failure (the right document was fetched but the model ignored or misread it). You need to evaluate both.

A simple evaluation framework:

```python
def evaluate_rag(test_cases, retrieve_fn, llm_fn):
    """
    test_cases: list of {"query": ..., "expected_doc": ..., "expected_answer": ...}
    """
    retrieval_hits = 0
    answer_scores = []
    
    for tc in test_cases:
        retrieved = retrieve_fn(tc["query"])
        if any(tc["expected_doc"] in doc for doc in retrieved):
            retrieval_hits += 1
        
        answer = llm_fn(tc["query"], retrieved)
        # Score answer quality (exact match, contains key phrase, or LLM judge)
        score = score_answer(answer, tc["expected_answer"])
        answer_scores.append(score)
    
    print(f"Retrieval recall: {retrieval_hits / len(test_cases):.2%}")
    print(f"Answer quality: {np.mean(answer_scores):.2f}")
```

Separating the two error modes tells you where to focus: if retrieval recall is low, improve your embedding or chunking. If answer quality is low despite good retrieval, improve your prompt or switch models.

## Wrapping Up

RAG is the practical answer to "how do I make an LLM useful on my actual data?" It separates retrieval (what to look at) from generation (what to say about it), making the system updatable, attributable, and more accurate on factual questions. The implementation is approachable — a vector store, an embedding model, and a well-constructed prompt get you most of the way there.

Next month I'm switching to game dev, looking at how games have done AI from the beginning — finite state machines, behavior trees, and when (rarely) it makes sense to reach for ML.

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
