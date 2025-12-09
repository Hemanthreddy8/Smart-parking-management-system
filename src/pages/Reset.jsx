import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Reset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Reset link sent to your email!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-i-cont">
        <h2>Reset Password</h2>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <button onClick={handleReset}>Send Reset Link</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Reset;
