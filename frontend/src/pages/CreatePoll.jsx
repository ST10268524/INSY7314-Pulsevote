import { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['','']);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const opts = options.filter(o=>o.trim());
      await API.post('/polls', { question, options: opts });
      alert('Poll created');
      nav('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Poll</h2>
      <input placeholder='Question' value={question} onChange={e=>setQuestion(e.target.value)} />
      {options.map((opt,i)=>(
        <input key={i} placeholder={`Option ${i+1}`} value={opt} onChange={e=>{ const copy=[...options]; copy[i]=e.target.value; setOptions(copy); }} />
      ))}
      <button type='button' onClick={()=>setOptions([...options,''])}>Add option</button>
      <button type='submit'>Create</button>
    </form>
  );
}
