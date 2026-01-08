import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import CreatePostModal from '../components/post/CreatePostModal';
import MessagesList from './MessagesList';

const Messages = () => {
  const navigate = useNavigate();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleSelectChat = (chatId) => {
    navigate(`/messages/${chatId}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-[50px] md:pb-0 pt-[50px] md:pt-0">
      <Sidebar onCreatePost={() => setShowCreatePost(true)} />
      <MobileBottomNav onCreatePost={() => setShowCreatePost(true)} />

      <main className="md:ml-[245px]">
        <div className="max-w-[935px] mx-auto">
          <MessagesList onSelectChat={handleSelectChat} />
        </div>
      </main>

      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />
    </div>
  );
};

export default Messages;
