/**
 * Login Page Component
 * 
 * Handles user authentication with username and password.
 * Provides form validation and error handling for login attempts.
 * 
 * Features:
 * - Username and password input fields
 * - Form submission with API call
 * - JWT token storage on successful login
 * - Error handling and user feedback
 * - Automatic navigation to home page on success
 * 
 * @author PulseVote Team
 * @version 1.0.0
 */

import { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

/**
 * Login Page Component
 * 
 * @returns {JSX.Element} - The login page component
 */
export default function LoginPage() {
  // State for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Navigation hook for programmatic routing
  const nav = useNavigate();

  /**
   * Handle login form submission
   * 
   * Sends login credentials to the API and handles the response.
   * On success, stores JWT token and redirects to home page.
   * On failure, displays error message to user.
   * 
   * @param {Event} e - Form submission event
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Send login request to API
      const res = await API.post('/auth/login', { username, password });
      
      // Store JWT token in localStorage for future requests
      localStorage.setItem('token', res.data.token);
      
      // Show success message and redirect to home page
      alert('Login successful');
      nav('/');
    } catch (err) {
      // Display error message from API or generic error
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      
      {/* Username input field */}
      <input 
        placeholder='Username' 
        value={username} 
        onChange={e => setUsername(e.target.value)} 
        required
      />
      
      {/* Password input field */}
      <input 
        placeholder='Password' 
        type='password' 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        required
      />
      
      {/* Submit button */}
      <button type='submit'>Login</button>
    </form>
  );
}
