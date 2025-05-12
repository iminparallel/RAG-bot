## evo11ve-take-home

## Description

A Retrieval-Augmented Generation (RAG) chatbot:

1. Ingests PDF documents: Parses one PDF at a time, splits them into meaningful overlapping
   chunks, embeds them in a vector store.
2. Handles questions: Accepts free-form user questions and returns accurate, and
   appropriate answers drawn from the ingested PDFs.
3. Provides a UI: Offers a simple, user-friendly web interface using React.js where users can upload PDFs, enter questions, and view answers, and the sources of the anser (document name and page number).
4. Is deployed and shareable: Hosted at a public URL, this is the source code
   GitHub repository.

## How to run this project locally?

To run this project you need a couple of prerequisites

1. You need to have Node.js installed in your computer, you can download the latest version here https://nodejs.org/en/download
2. You need to have the yarn package manager (you can also use pnpm). Run this command to install it `npm install --global yarn` then check if it was properly installed `yarn --version`

---

3. clone the github repository

4.
