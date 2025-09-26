import { Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PollList from './pages/PollList';
import CreatePoll from './pages/CreatePoll';

export default function App() {
  return (
    <div>
      <nav>
        <Link to='/'>Polls</Link> | <Link to='/create'>Create Poll</Link> | <Link to='/login'>Login</Link> | <Link to='/register'>Register</Link>
      </nav>
      <Routes>
        <Route path='/' element={<PollList />} />
        <Route path='/create' element={<CreatePoll />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
      </Routes>
    </div>
  );
}
