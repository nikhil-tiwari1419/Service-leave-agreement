import React, { useState } from "react";
import { useTheme } from "../Context/Theme";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const { theme } = useTheme();

  const [mode, setMode] = useState("signIn"); // signIn | signUp
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seePassword, setSeePassword] = useState(false);
  
  
  return ( 

    <div
      className={`min-h-screen px-4 ubuntu-regular  flex flex-col items-center justify-center ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
      }`}
    >
        <h1 className="flex flex-col text-center items-center font-semibold py-3 sm:text-2xl text-lg underline  ">SignIn / SingUp here </h1>
      <div
        className={`w-full h-[650px] pt-20 max-w-md p-6 rounded-lg shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6">
          {mode === "signIn" ? "Sign In ⬇️" : "Create Account ⬇️"}
        </h2>

        {/* Form */}
        <form className="space-y-4">
          {/* Name (only for signup) */}
          {mode === "signUp" && (
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded-2xl border focus:outline-none focus:ring"
            />
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-5 rounded-3xl border focus:outline-none focus:ring"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={seePassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 my-5 rounded-2xl border focus:outline-none focus:ring pr-10"
            />
            <span
              onClick={() => setSeePassword(!seePassword)}
              className="absolute right-5 top-7 cursor-pointer text-gray-500"
            >
              {seePassword ? <EyeOff size={25} /> : <Eye size={25} />}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-10 w-full items-center   bg-lime-500 hover:bg-lime-700 text-white py-2 my-5 rounded-full transition"
          >
            {mode === "signIn" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Toggle Mode */}
        <p className="text-sm text-center mt-4">
          {mode === "signIn" ? (
            <>
              Don’t have an account?{" "}
              <span
                onClick={() => setMode("signUp")}
                className="text-indigo-500 cursor-pointer"
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setMode("signIn")}
                className="text-indigo-500 cursor-pointer"
              >
                Sign In
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
