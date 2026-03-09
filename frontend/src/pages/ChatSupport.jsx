import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import ChatMessage from '../components/ChatMessage'

export default function ChatSupport(){

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  const [messages, setMessages] = useState([
    {from:'agent', text:'Hello! How can I help you today?', time:'10:00'},
    {from:'user', text:'I had a payout processed.', time:'10:02'}
  ])
  const [text, setText] = useState('')
  const send = ()=>{
    if(!text) return
    setMessages([...messages, {from:'user', text, time:'now'}])
    setText('')
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
