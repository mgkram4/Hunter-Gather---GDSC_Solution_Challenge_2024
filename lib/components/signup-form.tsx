"use client";

import { supabase } from "@api/supabase";
import React, { useState } from "react";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUpNewUser = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {},
    });

    if (error) {
      console.error("Sign-up error:", error.message);
    } else {
      console.log("Sign-up successful:", data);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form
        className="grid grid-cols-1 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          signUpNewUser();
        }}
      >
        <label className="block">
          Email:
          <input
            type="email"
            className="mt-1 p-2 w-full border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block">
          Password:
          <input
            type="password"
            className="mt-1 p-2 w-full border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
