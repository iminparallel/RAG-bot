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

3. Clone the github repository

4. Create a .env file in the root directory

5. Populate the .env with the necessary keys: detailed guide on how to obtain them is in the next section

6. Example .env file:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
TOGETHER_AI_KEY=
HUGGINGFACEHUB_API_KEY=
GROQ_API_KEY=
```

7. Run `yarn` to install the dependencies from package.json

8. run `yarn dev` to run in localhost

9. You will see the port it is launching on on the terminal, and visit the address (if port 3000 is free it will be launched there)

## Guide to populate .env file

1. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
2. CLERK_SECRET_KEY=
   Go to https://dashboard.clerk.com/ , log in and create a new application. With an application name of your choice, enable user authentication via credentials by toggling on Email and allow user authentication via Social Sign-On by toggling on providers such as Google, GitHub and Microsoft.
   Once the application is created in the Clerk dashboard, you will be shown with your application's API keys for Next.js. You will find the first two keys of the .env file here.
3. UPSTASH_REDIS_REST_URL
4. UPSTASH_REDIS_REST_TOKEN
5. UPSTASH_VECTOR_REST_URL
6. UPSTASH_VECTOR_REST_TOKEN
   Go to https://console.upstash.com/ and log in,
   i. create a Redis database and copy the UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
   ii. create a Vector database and copy the UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN, select 768 bge-base-en-v1.5 as the vector embedding standard
7. HUGGINGFACEHUB_API_KEY
   Create a Hugging Face Account: visit the Hugging Face website and sign up for an account. Log In: Once you have an account, log in to Hugging Face. Then visit https://huggingface.co/settings/tokens
   Navigate to Your Profile Settings: Click on your profile icon in the upper right corner and select "Settings". Go to Access Tokens: In your settings, find the "Access Tokens" section. Generate a New API Token: Click on the "New Token" or similar button to generate a new HUGGINGFACEHUB_API_KEY.
   `Allow read and write access to repositories and inference.`
8. GROQ_API_KEY
   Go to https://console.groq.com/keys to generate the GROQ_API_KEY
