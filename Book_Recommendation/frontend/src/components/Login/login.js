import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login({ setIsLoggedIn }) {
  const [form, setForm] = useState({ emailOrUsername: '', loginPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.emailOrUsername || !form.loginPassword) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/login', {
        emailOrUsername: form.emailOrUsername,
        password: form.loginPassword
      });
      alert(res.data.message);
      localStorage.setItem('username', form.emailOrUsername);
      setIsLoggedIn(true);
      navigate('/home');
    } catch (error) {
      setError(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="logo-section">
        <h2><span className="icon-android">📚</span></h2>
      </div>
      <div className="login-col-right">
        <div className="login-form-container">
          <h2 className="login-text-center">Log In</h2>
          {error && <p className="login-error-message">{error}</p>}
          <form className="login-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="emailOrUsername"
              className="login-input"
              placeholder="Enter Email or Username"
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="loginPassword"
              className="login-input"
              placeholder="Enter Password"
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Submit"}
            </button>
          </form>
          <div className="login-register-link">
            <p>Don't have an account? <Link to="/signup">Register Here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
