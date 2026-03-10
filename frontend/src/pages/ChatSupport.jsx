import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import ChatMessage from '../components/ChatMessage'
import { postQuery, getMyQueries } from '../api';

export default function ChatSupport(){

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else load();
  }, []);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  async function load() {
    try {
      const qs = await getMyQueries();
      // convert to chat messages
      const msgs = [];
      qs.forEach(q => {
        msgs.push({ from: 'user', text: q.question, time: q.createdAt });
        if (q.answer) {
          msgs.push({ from: 'agent', text: q.answer, time: q.answeredAt || '' });
        }
      });
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  }

  const send = async ()=>{
    if(!text) return
    try {
      await postQuery(text);
      setText('');
      load();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Chat Support</h2>
      <div className="card h-[60vh] flex flex-col">
        <div className="flex-1 overflow-auto mb-4">
          {messages.map((m,i)=>(<ChatMessage key={i} from={m.from} text={m.text} time={m.time} />))}
        </div>
        <div className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Type a message" />
          <button onClick={send} className="px-4 py-2 bg-primary text-white rounded">Send</button>
        </div>
      </div>
    </>
  )
}
