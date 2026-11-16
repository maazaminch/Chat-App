import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import ConversationItem from './ConversationItem';
import Loader from '../feedback/Loader';
import ErrorState from '../feedback/ErrorState';
import NoData from '../feedback/NoData';
import { getInitials } from '@/lib/utils';
import { Input } from '@/features/ui/input';

const Sidebar = ({ 
  selectedConversationId, 
  onSelect, 
  onStartNewChat, 
  onlineUsers
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Use useChat hook with search query
  const { conversations, conversationsLoading, conversationsError } = useChat(null, searchQuery.trim());

  // Get arrays from responses
  const conversationsArray = Array.isArray(conversations?.conversations) ? conversations.conversations :
                              Array.isArray(conversations?.data) ? conversations.data :
                              Array.isArray(conversations) ? conversations : [];

  // New users from backend response (only when searching)
  const newUsersArray = Array.isArray(conversations?.newUsers) ? conversations.newUsers : [];

  const handleSelectConversation = (conversationId) => {
    onSelect(conversationId);
  };

  const handleSelectNewUser = (userId) => {
    onStartNewChat(userId);
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header with Search */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white text-lg font-semibold mb-3">Conversations</h2>
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversationsLoading ? (
          <Loader text="Loading..." />
        ) : conversationsError ? (
          <ErrorState text="Error loading conversations" />
        ) : conversationsArray.length === 0 && newUsersArray.length === 0 ? (
          <NoData
            text={searchQuery ? "No results found" : "No conversations yet"}
            description={searchQuery ? "Try a different search" : "Search users to start chatting"}
          />
        ) : (
          <div className="flex flex-col">
            {/* Existing Conversations */}
            {conversationsArray.map((conversation) => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                isSelected={String(conversation._id) === String(selectedConversationId)}
                onlineUsers={onlineUsers}
                onSelect={handleSelectConversation}
              />
            ))}

            {/* New Users (only when searching) */}
            {newUsersArray.map((u) => {
              const initials = getInitials(u.name);
              return (
                <div
                  key={u._id}
                  onClick={() => handleSelectNewUser(u._id)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {initials}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{u.name}</h3>
                    <p className="text-gray-400 text-sm truncate">{u.email}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
