---
layout: posts
title: "Semantic Search: Teaching Computers to Understand Meaning"
date: 2026-12-01 09:00:00 -0700
tags: [machine-learning, nlp, embeddings, search]
excerpt: "Keyword search finds documents that contain your words. Semantic search finds documents that mean what you meant. Here's how embedding models bridge the gap — and how to build it yourself."
---

Keyword search is easy to understand: you search for "neural network training", and the engine finds documents containing those exact words. It's fast, deterministic, and completely misses the point half the time. A document that discusses "how gradient descent optimizes a deep learning model" is relevant to your query, but it might not contain the word "training" at all.

Semantic search solves this. Instead of matching tokens, it matches meaning — and the way it does that is surprisingly elegant.

## Embeddings: Numbers That Encode Meaning

The foundation of semantic search is the **embedding** — a dense vector representation of text that captures semantic meaning. The key property: texts with similar meanings produce embeddings that are close together in vector space, while texts with different meanings are far apart.

Concretely, a sentence embedding might be a vector of 384 or 768 floating-point numbers. Those numbers don't have intuitive interpretations on their own — but the geometric relationships between them do. "Machine learning" and "deep learning" will have embeddings close to each other. "Machine learning" and "medieval architecture" will be far apart.

These embeddings come from models — specifically, transformer models fine-tuned for the task of semantic similarity. The popular `sentence-transformers` library wraps many of these:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

sentences = [
    "How does gradient descent work?",
    "Explain the backpropagation algorithm",
    "What is the best pizza in Rome?"
]

embeddings = model.encode(sentences)
print(embeddings.shape)  # (3, 384)
```

Three sentences, each represented as a 384-dimensional vector. The embedding for sentence 1 and sentence 2 will be close together. Sentence 3 will be far from both.

## Cosine Similarity

To measure how similar two embeddings are, you use **cosine similarity** — the cosine of the angle between them:

```
similarity = (A · B) / (|A| × |B|)
```

This gives a value between -1 and 1. Values near 1 mean the vectors point in the same direction (similar meaning); near 0 means orthogonal (unrelated); near -1 means opposite (rare in practice with text embeddings, which tend to live in the positive quadrant).

Why cosine rather than Euclidean distance? Cosine similarity is invariant to vector magnitude — it only cares about direction. Two documents of different lengths can have similar meaning, so you want a metric that ignores the "size" of the vector.

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

Or, more efficiently for many-to-many comparisons, use matrix operations:

```python
from sklearn.metrics.pairwise import cosine_similarity

query_embedding = model.encode(["How does gradient descent work?"])
similarities = cosine_similarity(query_embedding, embeddings)
# Returns scores for all three documents
```

## Building a Simple Semantic Search Engine

Here's the full pipeline:

```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

# Your document corpus (in practice, loaded from a database or file)
documents = [
    "Backpropagation is the algorithm for computing gradients in neural networks.",
    "Gradient descent minimizes the loss function by stepping in the direction of steepest descent.",
    "The Eiffel Tower is located in Paris, France.",
    "Convolutional neural networks excel at image recognition tasks.",
    "Paris is the capital city of France."
]

# Encode all documents (do this once; store the embeddings)
doc_embeddings = model.encode(documents)

def search(query, top_k=3):
    query_embedding = model.encode([query])
    scores = cosine_similarity(query_embedding, doc_embeddings)[0]
    
    top_indices = np.argsort(scores)[::-1][:top_k]
    return [(documents[i], scores[i]) for i in top_indices]

results = search("explain how neural networks learn")
for doc, score in results:
    print(f"{score:.3f}: {doc}")
```

Output:
```
0.821: Backpropagation is the algorithm for computing gradients in neural networks.
0.714: Gradient descent minimizes the loss function by stepping in the direction of steepest descent.
0.623: Convolutional neural networks excel at image recognition tasks.
```

The query "explain how neural networks learn" has no keyword overlap with the top result, but the semantic similarity is high. That's what semantic search does.

## Scaling Up: Vector Databases

For a small corpus, brute-force cosine similarity over all documents is fine. For millions of documents, you need an index.

**Vector databases** like Chroma, Pinecone, Weaviate, or Qdrant store embeddings and support fast approximate nearest-neighbor (ANN) search. Instead of comparing your query against every document, they use data structures (HNSW, IVF) that narrow the search to a small candidate set. You trade a small amount of accuracy for a massive speedup.

```python
import chromadb

client = chromadb.Client()
collection = client.create_collection("my-docs")

# Add documents (Chroma handles embedding if you provide a model)
collection.add(
    documents=documents,
    ids=[f"doc{i}" for i in range(len(documents))]
)

# Query
results = collection.query(query_texts=["explain how neural networks learn"], n_results=3)
```

For most practical use cases — a knowledge base, a documentation search, a product catalog — a vector database makes semantic search production-ready.

## Hybrid Search

Pure semantic search is great for conceptual queries but can underperform keyword search for exact lookups. Searching for a specific product SKU, a person's name, or a technical term like "ReLU" is often better served by keyword matching.

**Hybrid search** combines both: run keyword search and semantic search in parallel, then merge the results. A simple approach is **Reciprocal Rank Fusion (RRF)**: take the rank of each document in both result lists, compute a score based on those ranks, and re-rank by the combined score.

```python
def reciprocal_rank_fusion(keyword_results, semantic_results, k=60):
    scores = {}
    for rank, doc_id in enumerate(keyword_results):
        scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
    for rank, doc_id in enumerate(semantic_results):
        scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
    return sorted(scores.keys(), key=lambda d: scores[d], reverse=True)
```

In my experience, hybrid search outperforms either method alone on most real-world corpora. It's the right default for production systems.

## Things to Know

**Embedding quality varies by domain.** A general-purpose embedding model will work well for general text. For highly specialized domains (legal documents, medical literature, code), a domain-specific fine-tuned model often performs significantly better.

**Chunking matters.** For long documents, you typically split them into overlapping chunks before embedding. The chunk size is a real hyperparameter — too small and you lose context; too large and individual chunks become too general to distinguish. 200–500 tokens with some overlap is a common starting point.

**Embeddings are static.** A standard embedding model produces the same embedding for the same text regardless of query context. Newer approaches (like late interaction models such as ColBERT) produce context-aware representations that better handle ambiguous queries.

## Wrapping Up

Semantic search closes the gap between what you type and what you mean. The core is simple: encode documents and queries as dense vectors, find documents with similar vectors. Cosine similarity gives you the metric; embedding models give you the representations; vector databases give you the scale. It's one of the most practically useful applications of ML I've worked with — and it's one of the building blocks for the next post, where I'll be talking about RAG and how LLMs use retrieval to access your data.

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
