import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Chat from "@/Components/Chat";

// Accepts userId as parameter
type Params = Promise<{ userId: any }>;
/**
 * Chat route
 */

const page = async ({ params }: { params: Params }) => {
  // Gets current user data
  const user = await currentUser();
  // If user does not exist throws back to landing page
  if (!user?.id) {
    redirect("/");
  }

  const { userId } = await params;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 via-gray-800 to-gray-700 px-4 py-4 sm:py-8 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full pt-10 max-w-5xl h-[95vh] flex flex-col rounded-2xl shadow-2xl bg-white/10 backdrop-blur-lg text-white overflow-hidden border border-white/20 m-0">
        {/* Header */}
        <header className="p-4 bg-white/10 backdrop-blur border-b border-white/10 text-lg font-semibold">
          👋 Welcome, {user?.fullName || "User"}
        </header>

        {/* Chat */}
        <section className="flex-grow overflow-hidden p-1">
          {/* Renders Client side chat component */}
          <Chat userId={userId} />
        </section>
      </main>
    </div>
  );
};

export default page;
