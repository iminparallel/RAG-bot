"use client";
import React from "react";
import { SignUpButton, SignInButton, useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Header = () => {
  const { isSignedIn } = useUser();
  console.log("signed in?", isSignedIn);
  /**
   * Header Component
   */
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left Side - Logo or Title */}
        <Link href="/" className="text-xl font-semibold hover:text-gray-300">
          RAG bot
        </Link>

        {/* Right Side - Nav Links / Auth Buttons */}
        <nav className="flex items-center gap-4">
          <Link
            className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-200 transition animate-fade-in delay-300"
            href="/"
          >
            Home
          </Link>
          {!isSignedIn ? (
            <div className="flex gap-2">
              <SignUpButton>
                <button className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-200 transition animate-fade-in delay-300">
                  Sign Up
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-200 transition animate-fade-in delay-300">
                  Sign In
                </button>
              </SignInButton>
            </div>
          ) : (
            <UserButton />
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
