/**
 * Registration Page Component
 * 
 * Handles new user registration with username and password.
 * Provides form validation and error handling for registration attempts.
 * 
 * Features:
 * - Username and password input fields
 * - Form submission with API call
 * - JWT token storage on successful registration
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
 * Registration Page Component
 * 
 * @returns {JSX.Element} - The registration page component
 */
export default function RegisterPage() {
  // State for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Navigation hook for programmatic routing
  const nav = useNavigate();

  /**
   * Handle registration form submission
   * 
   * Sends registration data to the API and handles the response.
   * On success, stores JWT token and redirects to home page.
   * On failure, displays error message to user.
   * 
   * @param {Event} e - Form submission event
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      // Send registration request to API
      const res = await API.post('/auth/register', { username, password });
      
      // Store JWT token in localStorage for future requests
      localStorage.setItem('token', res.data.token);
      
      // Show success message and redirect to home page
      alert('Registered');
      nav('/');
    } catch (err) {
      // Display error message from API or generic error
      alert(err.response?.data?.message || 'Register failed');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      
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
      <button type='submit'>Register</button>
    </form>
  );
}
