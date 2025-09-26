/**
 * Poll List Component
 * 
 * Displays all available polls with voting functionality.
 * Fetches polls from the API and allows users to vote on poll options.
 * 
 * Features:
 * - Fetches and displays all polls
 * - Shows poll questions and options with vote counts
 * - Voting functionality for each poll option
 * - Error handling for API calls
 * - Automatic refresh after voting
 * 
 * @author PulseVote Team
 * @version 1.0.0
 */

import { useEffect, useState } from 'react';
import API from '../api';

/**
 * Poll List Component
 * 
 * @returns {JSX.Element} - The poll list component
 */
export default function PollList() {
  // State for storing polls data
  const [polls, setPolls] = useState([]);
  
  // Fetch polls on component mount
  useEffect(() => { 
    fetchPolls() 
  }, []);

  /**
   * Fetch all polls from the API
   * 
   * Retrieves the list of all polls and updates the component state.
   * Handles errors by logging them to the console.
   */
  const fetchPolls = async () => {
    try {
      const res = await API.get('/polls');
      setPolls(res.data);
    } catch (err) {
      // Log error for debugging purposes
      // eslint-disable-next-line no-console
      console.error('Error fetching polls:', err);
    }
  };

  /**
   * Handle voting on a poll option
   * 
   * Sends a vote request to the API for the specified poll and option.
   * Refreshes the poll list after successful voting.
   * 
   * @param {string} id - Poll ID
   * @param {number} idx - Option index to vote for
   */
  const vote = async (id, idx) => {
    try {
      await API.post(`/polls/${id}/vote`, { optionIndex: idx });
      
      // Refresh polls to show updated vote counts
      fetchPolls();
    } catch (err) {
      // Display error message to user
      alert(err.response?.data?.message || 'Vote failed');
    }
  };

  return (
    <div>
      <h2>Polls</h2>
      
      {/* Render each poll */}
      {polls.map(poll => (
        <div key={poll._id} style={{ border: '1px solid #ccc', padding: 8, margin: 8 }}>
          {/* Poll question */}
          <strong>{poll.question}</strong>
          
          {/* Poll options with vote counts and voting buttons */}
          <ul>
            {poll.options.map((option, index) => (
              <li key={index}>
                {option.text} — {option.votes} votes
                <button onClick={() => vote(poll._id, index)}>
                  Vote
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
