/**
 * Create Poll Component
 * 
 * Allows authenticated users to create new polls with questions and multiple options.
 * Provides dynamic option management and form validation.
 * 
 * Features:
 * - Poll question input field
 * - Dynamic option inputs (minimum 2 options)
 * - Add/remove option functionality
 * - Form validation and submission
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
 * Create Poll Component
 * 
 * @returns {JSX.Element} - The create poll component
 */
export default function CreatePoll() {
  // State for poll question
  const [question, setQuestion] = useState('');
  
  // State for poll options (starts with 2 empty options)
  const [options, setOptions] = useState(['', '']);
  
  // Navigation hook for programmatic routing
  const nav = useNavigate();

  /**
   * Handle poll creation form submission
   * 
   * Validates form data, filters out empty options, and submits to API.
   * On success, shows confirmation and redirects to home page.
   * On failure, displays error message to user.
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Filter out empty options
      const validOptions = options.filter(opt => opt.trim());
      
      // Send poll creation request to API
      await API.post('/polls', { question, options: validOptions });
      
      // Show success message and redirect to home page
      alert('Poll created');
      nav('/');
    } catch (err) {
      // Display error message from API or generic error
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  /**
   * Add a new option field to the poll
   * 
   * Appends an empty string to the options array to create a new input field.
   */
  const addOption = () => {
    setOptions([...options, '']);
  };

  /**
   * Update a specific option value
   * 
   * Updates the value of an option at the specified index.
   * 
   * @param {number} index - Index of the option to update
   * @param {string} value - New value for the option
   */
  const updateOption = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Poll</h2>
      
      {/* Poll question input */}
      <input 
        placeholder='Question' 
        value={question} 
        onChange={e => setQuestion(e.target.value)} 
        required
      />
      
      {/* Dynamic option inputs */}
      {options.map((option, index) => (
        <input 
          key={index} 
          placeholder={`Option ${index + 1}`} 
          value={option} 
          onChange={e => updateOption(index, e.target.value)} 
        />
      ))}
      
      {/* Add option button */}
      <button type='button' onClick={addOption}>
        Add option
      </button>
      
      {/* Submit button */}
      <button type='submit'>Create</button>
    </form>
  );
}
