import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white flex flex-col justify-center items-center px-4 sm:px-8 font-[family-name:var(--font-geist-sans)]">
      <main className="text-center space-y-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text animate-fade-in">
          Welcome to evo11ve RAG
        </h1>

        <p className="text-lg sm:text-xl max-w-xl mx-auto text-gray-300 animate-fade-in delay-200">
          An AI-powered Retrieval-Augmented Generation app to help you find and
          generate insights fast.
        </p>

        {user?.id ? (
          <Link
            href={`/Chat/${user.id}`}
            className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-200 transition animate-fade-in delay-300"
          >
            🚀 Enter the RAG
          </Link>
        ) : (
          <p className="text-gray-400 animate-fade-in delay-300">
            🔒 Please sign in to use the service
          </p>
        )}
      </main>
    </div>
  );
}
