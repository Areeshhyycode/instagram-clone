// MessagesList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';

const fakeConversations = [
  {
    id: 1,
    username: 'john_doe',
    name: 'John Doe',
    lastMessage: 'Kya haal hai?',
    time: '2 min',
    unread: true,
    profilePic: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: 2,
    username: 'jane_smith',
    name: 'Jane Smith',
    lastMessage: 'Photo dekh li?',
    time: '1 hr',
    unread: false,
    profilePic: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: 3,
    username: 'rohit_k',
    name: 'Rohit Kumar',
    lastMessage: 'Kal milte hain',
    time: '3 hr',
    unread: true,
    profilePic: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: 4,
    username: 'priya_sharma',
    name: 'Priya Sharma',
    lastMessage: '😂😂',
    time: 'Yesterday',
    unread: false,
    profilePic: 'https://randomuser.me/api/portraits/women/4.jpg'
  },
];

const MessagesList = ({ onSelectChat }) => {
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const fetchSuggestedUsers = async () => {
    try {
      const response = await userService.getSuggestedUsers(4);
      setSuggestedUsers(response);
    } catch (error) {
      console.log('Error fetching suggested users:', error);
      setSuggestedUsers([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSeeAllClick = () => {
    navigate('/messages/suggested');
  };

  return (
    <div className="w-full md:max-w-lg mx-auto bg-white min-h-screen">
      {/* Header - Hidden on mobile */}
      <div className="hidden md:flex justify-between items-center px-4 py-2 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">username</h1>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages Header with New Message */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Messages</h2>
          <button className="text-blue-500 font-semibold text-sm hover:text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-gray-200"
          />
          <svg
            className="w-4 h-4 absolute left-3 top-3 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Suggested for you Section */}
      <div className="px-4 pb-4 border-b">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold">Suggested for you</h3>
          <button
            onClick={handleSeeAllClick}
            className="text-xs font-semibold text-blue-500 hover:text-blue-600"
          >
            See All
          </button>
        </div>

        {/* Suggested Users Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {loadingSuggestions ? (
            // Loading skeleton
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 text-center animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-200 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                <div className="h-2 bg-gray-200 rounded w-12" />
              </div>
            ))
          ) : suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => navigate(`/profile/${user.username}`)}
                className="flex-shrink-0 text-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-2 ring-2 ring-gray-200">
                  <img
                    src={
                      user.profilePic && user.profilePic.startsWith('/uploads/')
                        ? `http://localhost:8000${user.profilePic}`
                        : 'https://via.placeholder.com/64'
                    }
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-semibold truncate w-16">{user.username}</p>
                <p className="text-xs text-gray-500 truncate w-16">
                  {user.mutualFollowers > 0 ? `${user.mutualFollowers} mutual` : 'New'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No suggestions available</p>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div>
        {fakeConversations.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer active:bg-gray-100 transition-colors"
          >
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <img
                src={chat.profilePic}
                alt={chat.username}
                className="w-14 h-14 rounded-full object-cover"
              />
              {chat.unread && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            {/* Chat Info */}
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <h3 className={`text-sm truncate ${chat.unread ? 'font-semibold' : 'font-normal'}`}>
                  {chat.username}
                </h3>
                <span className="text-xs text-gray-400 flex-shrink-0">{chat.time}</span>
              </div>
              <p className={`text-sm truncate ${chat.unread ? 'font-medium text-black' : 'text-gray-500'}`}>
                {chat.lastMessage}
              </p>
            </div>

            {/* Camera icon for new message (optional) */}
            {!chat.unread && (
              <button className="ml-2 p-1 opacity-0 hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesList;2