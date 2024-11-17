import React, { useState } from 'react';
import "../Create-Account/create.css";
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for redirection

function CreateAccount() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');

    // Generate user_id based on existing accounts
    const generatedUserId = `User_${Math.floor(Math.random() * 1000)}`; // Simple random user_id generation
    setUserId(generatedUserId); // Store user_id in state

    const formData = new URLSearchParams();
    formData.append('user_id', generatedUserId); // Include user_id in the form data
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    try {
      const response = await fetch('http://localhost:8080/backend/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        // Redirect to /login if the account creation is successful
        if (result.redirect) {
          navigate(result.redirect); // Redirect to login page
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An error occurred while creating the account');
    }
  };

  return (
    <div className="create-account-container">
      <h1>Create Account</h1>
      <form onSubmit={handleCreateAccount} className="create-account-form">
        <div className="form-group">
          <label htmlFor="name">Enter your name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Enter your email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Enter your password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default CreateAccount;
