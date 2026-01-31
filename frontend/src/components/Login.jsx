import React, { useState } from 'react';    
import google from '../../assets/google.svg';
import close from '../../assets/close.svg';
import { login } from '../api/authService';



function Login({ onClose, onSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ username: email, password });
      onClose();
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    <>
      <div className="form-container">
        <div className="flex flex-col justify-center w-full">
          <button
            className="relative r-10"
            style={{ position: 'relative', bottom: '10px', right: '20px' }}
            onClick={onClose}
          >
            <img src={close} alt="closeIcon" />
          </button>
          <p className="title">Welcome back</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
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
          <p className="page-link">
            <span className="page-link-label">Forgot Password?</span>
          </p>
          <button type="submit" className="form-btn">
            Log in
          </button>
        </form>
        <p className="sign-up-label" onClick={onSignUp}>
          Don't have an account?<span className="sign-up-link">Sign up</span>
        </p>
        <a href="https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://somatek.redjanvier.com/auth/grantcode&response_type=code&client_id=1067185943944-mg73t54iubhgr97hk53fbvtvgrcaf3kh.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&access_type=offline">
            <div className="buttons-container">
            <div className="google-login-button">
              <img src={google} alt="googleIcon" />
              <span>Log in with Google</span>
            </div>
          </div>
        </a>
      </div>
    </>
  );
}

export default Login;
