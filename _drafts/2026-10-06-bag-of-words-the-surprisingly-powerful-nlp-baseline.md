---
layout: posts
title: "Bag of Words: The Surprisingly Powerful NLP Baseline"
date: 2026-10-06 09:00:00 -0700
tags: [machine-learning, nlp, text-classification]
excerpt: "Before transformers, before word2vec, there was Bag of Words — a model so simple it ignores word order entirely. It's still one of the best first things to try on a text classification problem."
---

The first NLP approach I tried was a transformer. It was overkill. The task was classifying short support tickets into categories, and the dataset had about 2,000 examples. A fine-tuned BERT model got 84% accuracy after a lot of fiddling. A Bag of Words model with logistic regression got 81% in about twenty lines of code and trained in two seconds. For many text classification problems, that tradeoff is worth understanding.

## What Bag of Words Is

Bag of Words (BoW) is a way of representing text as a fixed-length vector. The idea: count how many times each word in your vocabulary appears in a document. Ignore word order. Ignore grammar. Just count.

Take two sentences:
- "The cat sat on the mat"
- "The mat sat on the cat"

These mean different things in context, but a BoW model represents them identically. Both produce the same word counts. This is the model's central limitation — and also, paradoxically, what makes it so robust on many tasks.

Concretely: you build a vocabulary from your corpus (say, 10,000 most common words). Each document becomes a vector of length 10,000 where the i-th entry is how many times the i-th word appeared. This vector is sparse — most entries are zero — but it's a perfectly valid numerical representation you can hand to any ML model.

## TF-IDF: A Better Count

Raw word counts have a problem: common words like "the", "a", and "is" appear in almost every document. They're not informative — knowing that a document contains the word "the" tells you nothing about its topic. But they dominate the raw counts.

**TF-IDF** (Term Frequency–Inverse Document Frequency) fixes this by downweighting words that appear in many documents:

```
TF-IDF(t, d) = TF(t, d) × IDF(t)

where:
TF(t, d) = count of term t in document d / total terms in d
IDF(t) = log(N / (1 + df(t)))
```

`N` is the number of documents in your corpus; `df(t)` is the number of documents containing the term. A word that appears in every document gets an IDF near zero — it gets filtered out. A rare but informative word gets a high IDF and thus a high TF-IDF score when it appears.

In practice this is the right default over raw counts for almost every task. Scikit-learn makes it one line:

```python
from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer(max_features=10000)
X_train = vectorizer.fit_transform(train_docs)
X_test = vectorizer.transform(test_docs)
```

## Building a Text Classifier in 20 Lines

Here's the full pipeline for a text classification problem:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

# Combine vectorization and model into a single pipeline
model = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=20000,
        ngram_range=(1, 2),    # include bigrams
        sublinear_tf=True,     # log-scale term frequencies
        min_df=2               # ignore terms in fewer than 2 documents
    )),
    ('clf', LogisticRegression(max_iter=1000, C=1.0))
])

model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(classification_report(y_test, predictions))
```

A few things worth noting here:

`ngram_range=(1, 2)` includes bigrams — pairs of consecutive words. This recovers some of the structure that pure unigrams miss. "not good" and "good" are different features. Bigrams often boost performance noticeably.

`sublinear_tf=True` applies a log transform to term frequencies: TF → 1 + log(TF). This prevents a word that appears 50 times from dominating one that appears 5 times by a factor of 10.

`C=1.0` is the regularization parameter for logistic regression. Lower values mean more regularization (smaller weights, less overfitting). This is usually the first thing to tune.

## Why It Still Works

Bag of Words "shouldn't" work as well as it does given that it throws away all syntactic information. In practice, for many classification problems, the vocabulary of a document is highly informative even without ordering. A document that contains "refund", "cancel", "billing", and "invoice" is probably about billing disputes, regardless of how those words are arranged.

For **sentiment analysis** on reviews, movie mentions, product names, and opinionated adjectives dominate the signal. For **spam detection**, certain words and phrases appear almost exclusively in spam. For **topic classification**, domain vocabulary clusters strongly by category.

The tasks where BoW struggles are the ones that require understanding relationships between words: negation ("this movie is not good"), coreference ("he said it was fine — it wasn't"), or nuanced reasoning. Transformers handle these better. But if you're doing any of the common classification tasks and your dataset is reasonably sized, BoW with TF-IDF + logistic regression is the baseline you should always run before reaching for something heavier.

## Practical Gotchas

**Text preprocessing.** Whether to lowercase, remove punctuation, strip stopwords, and stem or lemmatize words matters more than the choice of model. Lowercasing is almost always correct. Stopword removal is sometimes helpful, sometimes not — TF-IDF handles it implicitly for the most part. Lemmatization (reducing "running" → "run") can help for small datasets but rarely moves the needle significantly.

**Vocabulary size.** `max_features` is a real hyperparameter. Too small and you miss informative rare words. Too large and you include noise (misspellings, one-off tokens). 10,000–50,000 is a reasonable range to tune over.

**Class imbalance.** If your classes are imbalanced (90% negative, 10% positive), check `class_weight='balanced'` in logistic regression. It adjusts for class frequencies, otherwise your model will learn to just predict the majority class.

**Short text.** BoW can struggle with very short text (tweets, product names) because the vectors are almost entirely zeros. For these, character-level n-grams or subword approaches often work better.

## Wrapping Up

Bag of Words is a reminder that simple models, applied well, hold up remarkably well against complex ones. It throws away word order entirely, represents every document as a sparse count vector, and somehow produces classifiers that are hard to beat without significantly more data and compute. The lesson I take from it: always run the simple baseline first. It sets the floor, and sometimes the floor is high enough.

Next month I'm switching to game dev and talking about pixel art — the technical craft and aesthetic choices behind one of the most distinctive visual styles in games.

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
