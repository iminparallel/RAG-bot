"use client";
import React from "react";
import { SignUpButton, SignInButton, useUser, UserButton } from "@clerk/nextjs";

const Header = () => {
  const { isSignedIn } = useUser();
  console.log("signed in?", isSignedIn);

  return (
    <nav>
      <header>
        {" "}
        {!isSignedIn ? (
          <div className="gap-2 flex flex-row">
            {" "}
            <div className="bg-gray-200 rounded p-2 text-black">
              {" "}
              <SignUpButton />
            </div>
            <div className="bg-gray-200 rounded p-2 text-black">
              {" "}
              <SignInButton />
            </div>{" "}
          </div>
        ) : (
          <UserButton />
        )}
      </header>
    </nav>
  );
};

export default Header;
