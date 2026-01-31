import React, { useState } from "react";
import google from "../../public/assets/google.svg";
import close from "../../public/assets/close.svg";
import { signup } from "../api/authService";



function Register({ onClose, onSignIn }) {
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await signup({ name, email, password });
      localStorage.setItem("token", response.token);
      onClose();
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <>
      <div className="form-container">
        <div className="flex flex-col justify-center w-full">
          <button
            className="relative r-10"
            style={{ position: "relative", bottom: "10px", right: "20px" }}
            onClick={onClose}
          >
            <img src={close} alt="Close" />
          </button>
          <p className="title">Create Account</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="input"
            placeholder="FullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="text"
            className="input"
            placeholder="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="form-btn">
            Sign up
          </button>
        </form>
        <p className="sign-up-label" onClick={onSignIn}>
          Already have an account? <span className="sign-up-link">Login</span>
        </p>
        <div className="buttons-container">
          <div className="google-login-button">
            <img src={google} alt="Google" />
            <span>Register with Google</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
