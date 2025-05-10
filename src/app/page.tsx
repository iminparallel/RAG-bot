import Image from "next/image";

import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();
  console.log(user?.id);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>Hello evo11ve</div>
        {user?.id ? (
          <Link
            href={`Chat/{user?.id}`}
            className="bg-gray-200 rounded p-2 text-black"
          >
            Enter the RAG
          </Link>
        ) : (
          <div>Sign In to use Service</div>
        )}
      </main>
    </div>
  );
}
