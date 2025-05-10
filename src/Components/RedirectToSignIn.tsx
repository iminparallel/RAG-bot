"use client";
import { SignIn, SignUp } from "@clerk/clerk-react";

function AuthPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <SignIn />
      <h1>Sign Up</h1>
      <SignUp />
    </div>
  );
}

export default AuthPage;
