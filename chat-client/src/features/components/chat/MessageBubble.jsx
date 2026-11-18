import { formatTime, getInitials } from '../../../lib/utils.js';
import { MessageAttachment } from './MessageAttachment.jsx';

const MessageBubble = ({ message, isSent, senderName }) => {
  // Format timestamp (absolute time for messages)
  const time = formatTime(message.createdAt, 'time');

  // Generate initials for avatar (received messages only)
  const initials = getInitials(senderName || 'Unknown');

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`}>
      {/* Received message: show avatar */}
      {!isSent && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold mr-2 flex-shrink-0">
          {initials}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isSent
            ? 'bg-green-600 text-white rounded-br-sm'
            : 'bg-gray-700 text-white rounded-bl-sm'
        }`}
      >
        {/* Sender name (only for received messages) */}
        {!isSent && (
          <p className="text-xs text-gray-300 mb-1">{senderName}</p>
        )}

        {/* Message text or attachment */}
        {message.text && <p className="text-sm wrap-break-word">{message.text}</p>}

        {message.attachment && (
          <MessageAttachment
            messageId={message._id}
            attachment={message.attachment}
          />
        )}


        {/* Timestamp */}
        <p className={`text-xs mt-1 ${isSent ? 'text-green-200' : 'text-gray-400'}`}>
          {time}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
