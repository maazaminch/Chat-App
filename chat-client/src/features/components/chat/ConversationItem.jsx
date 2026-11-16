import { useAuth } from '../../../hooks/useAuth.js';
import { formatTime, getInitials, truncateText } from '../../../lib/utils.js';

const ConversationItem = ({ 
  conversation, 
  isSelected,
  onlineUsers = [], 
  onSelect }) => {
  const { user } = useAuth();

  // Find the other user (not current user) from memberIds
  const otherUser = conversation.memberIds?.find(
    (member) => String(member?._id ?? member) !== String(user?._id)
  );

  const otherUserId = otherUser?._id ?? otherUser;
  const isOnline = onlineUsers.some(
    (onlineUser) => String(onlineUser.userId) === String(otherUserId)
  );

  // Get the other user's name
  const userName = otherUser?.name || 'Unknown User';

  // Get last message text
  const lastMessageText = conversation.lastMessage?.text || 'No messages yet';

  // Truncate message if too long
  const truncatedMessage = truncateText(lastMessageText, 35);

  // Format timestamp (relative time for sidebar)
  const timeAgo = formatTime(conversation.updatedAt, 'relative');

  // Generate initials for avatar
  const initials = getInitials(userName);

  return (
    <div
      onClick={() => onSelect(conversation._id)}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-gray-700 border-l-4 border-blue-500'
          : 'bg-gray-800 hover:bg-gray-700 border-l-4 border-transparent'
      }`}
    >
      {/* Avatar with initials */}
      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shrink-0">
        {initials}
      </div>

      {/* Conversation info */}
      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-medium truncate">{userName}</h3>
          <div className="flex shrink-0 items-center gap-2">
            {isOnline && (
              <span className="text-green-400 text-xs">online</span>
            )}
            <span className="text-gray-400 text-xs">{timeAgo}</span>
          </div>
        </div>

        {/* Last message */}
        <p className="text-gray-400 text-sm truncate">{truncatedMessage}</p>
      </div>
    </div>
  );
};

export default ConversationItem;
