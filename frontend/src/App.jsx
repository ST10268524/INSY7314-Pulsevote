/**
 * Main App Component
 * 
 * Root component of the PulseVote frontend application.
 * Sets up routing and navigation for the polling application.
 * 
 * Features:
 * - React Router for client-side routing
 * - Navigation bar with links to all pages
 * - Route definitions for all application pages
 * 
 * @author PulseVote Team
 * @version 1.0.0
 */

import { Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PollList from './pages/PollList';
import CreatePoll from './pages/CreatePoll';

/**
 * Main App Component
 * 
 * @returns {JSX.Element} - The main application component
 */
export default function App() {
  return (
    <div>
      {/* Navigation Bar */}
      <nav>
        <Link to='/'>Polls</Link> | 
        <Link to='/create'>Create Poll</Link> | 
        <Link to='/login'>Login</Link> | 
        <Link to='/register'>Register</Link>
      </nav>
      
      {/* Route Definitions */}
      <Routes>
        {/* Home page - displays list of polls */}
        <Route path='/' element={<PollList />} />
        
        {/* Create poll page - authenticated users can create new polls */}
        <Route path='/create' element={<CreatePoll />} />
        
        {/* Login page - user authentication */}
        <Route path='/login' element={<LoginPage />} />
        
        {/* Registration page - new user signup */}
        <Route path='/register' element={<RegisterPage />} />
      </Routes>
    </div>
  );
}
