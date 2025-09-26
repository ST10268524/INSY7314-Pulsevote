import { useEffect, useState } from 'react';
import API from '../api';

export default function PollList() {
  const [polls, setPolls] = useState([]);
  useEffect(()=>{ fetchPolls() }, []);
  const fetchPolls = async () => {
    try {
      const res = await API.get('/polls');
      setPolls(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const vote = async (id, idx) => {
    try {
      await API.post(`/polls/${id}/vote`, { optionIndex: idx });
      fetchPolls();
    } catch (err) {
      alert(err.response?.data?.message || 'Vote failed');
    }
  };
  return (
    <div>
      <h2>Polls</h2>
      {polls.map(p => (
        <div key={p._id} style={{border:'1px solid #ccc', padding:8, margin:8}}>
          <strong>{p.question}</strong>
          <ul>
            {p.options.map((o,i)=>(<li key={i}>{o.text} — {o.votes} <button onClick={()=>vote(p._id,i)}>Vote</button></li>))}
          </ul>
        </div>
      ))}
    </div>
  );
}
