import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const fakeConversations = [
  {
    id: 1,
    username: 'john_doe',
    name: 'John Doe',
    lastMessage: 'Kya haal hai?',
    time: '2 min',
    unread: true,
    profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
    messages: [
      { id: 1, text: 'Hey!', sender: 'them', time: '10:30 AM' },
      { id: 2, text: 'Hi! Kaise ho?', sender: 'me', time: '10:31 AM' },
      { id: 3, text: 'Main theek hoon, tum?', sender: 'them', time: '10:32 AM' },
      { id: 4, text: 'Kya haal hai?', sender: 'them', time: '10:35 AM' },
    ]
  },
  {
    id: 2,
    username: 'jane_smith',
    name: 'Jane Smith',
    lastMessage: 'Photo dekh li?',
    time: '1 hr',
    unread: false,
    profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
    messages: [
      { id: 1, text: 'Photo dekhi?', sender: 'them', time: '9:00 AM' },
      { id: 2, text: 'Haan, bahut achhi hai!', sender: 'me', time: '9:15 AM' },
      { id: 3, text: 'Photo dekh li?', sender: 'them', time: '11:00 AM' },
    ]
  },
  {
    id: 3,
    username: 'rohit_k',
    name: 'Rohit Kumar',
    lastMessage: 'Kal milte hain',
    time: '3 hr',
    unread: true,
    profilePic: 'https://randomuser.me/api/portraits/men/3.jpg',
    messages: [
      { id: 1, text: 'Kal free ho?', sender: 'them', time: '2:00 PM' },
      { id: 2, text: 'Haan, kyun?', sender: 'me', time: '2:05 PM' },
      { id: 3, text: 'Kal milte hain', sender: 'them', time: '2:10 PM' },
      { id: 4, text: 'Okay, sure!', sender: 'me', time: '2:11 PM' },
    ]
  },
  {
    id: 4,
    username: 'priya_sharma',
    name: 'Priya Sharma',
    lastMessage: '😂😂',
    time: 'Yesterday',
    unread: false,
    profilePic: 'https://randomuser.me/api/portraits/women/4.jpg',
    messages: [
      { id: 1, text: 'Yeh dekho', sender: 'them', time: 'Yesterday' },
      { id: 2, text: '😂😂', sender: 'them', time: 'Yesterday' },
      { id: 3, text: 'Haha amazing!', sender: 'me', time: 'Yesterday' },
    ]
  },
];

const ChatScreen = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const chat = fakeConversations.find(c => c.id === parseInt(chatId));

  useEffect(() => {
    if (chat) {
      setMessages(chat.messages);
    }
  }, [chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chat not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={() => navigate('/messages')} className="hover:opacity-70">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img
          src={chat.profilePic}
          alt={chat.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <h2 className="font-semibold">{chat.username}</h2>
          <p className="text-xs text-gray-500">{chat.name}</p>
        </div>
        <button className="hover:opacity-70">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-3xl px-4 py-2 ${
                msg.sender === 'me'
                  ? 'bg-[#0095F6] text-white'
                  : 'bg-gray-100 text-black'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-3">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message..."
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:bg-gray-200"
        />
        {message.trim() ? (
          <button
            type="submit"
            className="text-[#0095F6] font-semibold hover:text-[#1877F2]"
          >
            Send
          </button>
        ) : (
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatScreen;
