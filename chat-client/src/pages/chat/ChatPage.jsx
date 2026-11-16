
import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useSocket } from "@/hooks/socket/useSocket";
import Sidebar from "@/features/components/chat/Sidebar";
import ChatWindow from "@/features/components/chat/ChatWindow";
import ChatLayout from "@/features/layout/ChatLayout";



const ChatPage = () => {

    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const { createConversation, conversations } = useChat(null, '');
    const { socket, isConnected, connectionError } = useSocket()

    const [onlineUsers, setOnlineUsers] = useState([])
    useEffect(() => {
        if (!socket) return;

    const handleOnlineUsers = (users) => {
        setOnlineUsers(users);
    }

    socket.on("users:online", handleOnlineUsers)

    return () => {
        socket.off('users:online', handleOnlineUsers)
    }
    })

    // Get selected conversation data when ID changes
    useEffect(() => {
        if (!selectedConversationId || !conversations?.conversations) return;
        const convo = conversations.conversations.find(c => c._id === selectedConversationId);
        setSelectedConversation(convo || null);
    }, [selectedConversationId, conversations?.conversations]);

    const handleSelectConversation = (conversationId) => {
        setSelectedConversationId(conversationId);
    };

    const handleStartNewChat = async (userId) => {
        try {
            const result = await createConversation.mutateAsync(userId);
            const conversation = result?.data ?? result;
            if (!conversation?._id) {
                throw new Error('Conversation response did not include an ID');
            }
            setSelectedConversationId(conversation._id);
        } catch (error) {
            console.error('Failed to create conversation:', error);
        }
    };


    return (
        <ChatLayout
            sidebar={
                <Sidebar
                    selectedConversationId={selectedConversationId}
                    onlineUsers={onlineUsers}
                    onSelect={handleSelectConversation}
                    onStartNewChat={handleStartNewChat}
                />
            }
            chatWindow={
                <ChatWindow
                    conversationId={selectedConversationId}
                    conversation={selectedConversation}
                    socket={socket}
                    isConnected={isConnected}
                    connectionError={connectionError}
                />
            }
        />
    )
}

export default ChatPage