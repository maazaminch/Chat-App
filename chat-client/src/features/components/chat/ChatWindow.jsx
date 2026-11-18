import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useChatSocket } from "@/hooks/socket/useChatSocket";
import MessageBubble from "./MessageBubble";
import { AttachmentUploader } from "./AttachmentUploader";
import { useUploadAttachment } from "@/hooks/useUploadAttachment";

import Loader from "../feedback/Loader";
import ErrorState from "../feedback/ErrorState";
import NoData from "../feedback/NoData";
import { Input } from "@/features/ui/input";
import { Button } from "@/features/ui/button";
import { useTyping } from "@/hooks/socket/useTyping";

const ChatWindow = ({
    conversationId,
    conversation,
    socket,
    isConnected,
    connectionError
}) => {

    // upload attachment
    const [selectedFile, setSelectedFile] = useState(null)
    const [fileInputKey, setFileInputKey] = useState(0)
    const { uploadAttachment } = useUploadAttachment(conversationId)

    const { messages, messagesLoading, messagesError } = useChat(conversationId);
    const { user } = useAuth();

    const { sendMessage, isSending } = useChatSocket(socket, conversationId);
    const isSendingMessage = isSending || uploadAttachment.isPending;
    const messagesEndRef = useRef(null);
    const [inputText, setInputText] = useState('');

    const messagesArray = messages?.messages || [];

    // Get the other user in the conversation
    const recipientId = conversation?.memberIds?.find(
        (m) => String(m._id) !== String(user?._id)
    )?._id;

    const recipientName = conversation?.memberIds?.find(
        (m) => String(m._id) !== String(user?._id)
    )?.name || 'Unknown User';

    const {isTyping, startTyping, stopTyping} = useTyping(socket, recipientId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        const text = inputText.trim();

        if ((!text && !selectedFile) || !conversationId || isSendingMessage) return;

        if(selectedFile) {
            uploadAttachment.mutate(
                { file: selectedFile, text},
                {
                    onSuccess: ()=> {
                        setSelectedFile(null)
                        setInputText("")
                        setFileInputKey((key)=> key + 1)
                    }
                }
            )
            return
        }

        sendMessage(text, () => setInputText(''));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }


    if(!conversationId){
        return (
            <div className="text-white flex items-center justify-center h-full">
                <p>Please select a conversation</p>
            </div>
        );
    }


    return (
        <div className="flex flex-col h-full bg-gray-900">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-700">
                <h2 className="text-white font-semibold text-lg">{recipientName}</h2>
                {isTyping && (
                    <p className="text-sm text-blue-400 animate-pulse mt-1">
                        typing...
                    </p>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
            {messagesLoading ? (
                <Loader
                    text='Messages loading...'
                />
            ) : messagesError ? (
                <ErrorState
                    text='Error Occured'
                />
            ) : messagesArray.length === 0 ? (
                <NoData
                    text='No messages found'
                />
            ) : (
                // Render messages here
                <div>
                    {messagesArray.map((msg) => {
                        const senderId = msg.senderId?._id ?? msg.senderId;
                        const isSent = String(senderId) === String(user?._id);
                        return (
                            <MessageBubble
                                key={msg._id}
                                message={msg}
                                isSent={isSent}
                                senderName={isSent ? user?.name : msg.senderId?.name || 'User'}
                            />
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
            {!isConnected && (
                <p className="mb-2 text-sm text-gray-400">
                    {connectionError || 'Connecting to chat...'}
                </p>
            )}
            <div className="flex items-center gap-2">
                <Input
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                        setInputText(e.target.value);
                        startTyping();
                    }}
                    onBlur={stopTyping}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
                <AttachmentUploader
                    selectedFile={selectedFile}
                    onFileSelect={setSelectedFile}
                    inputKey={fileInputKey}
                    disabled={!isConnected || isSendingMessage}
                />
                <Button
                    onClick={handleSendMessage}
                    disabled={
                    (!inputText.trim() && !selectedFile) ||
                    !isConnected ||
                    isSendingMessage
                    }
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600"
                >
                    {uploadAttachment.isPending
                        ? "Uploading..."
                        : isSending
                            ? "Sending..."
                            : "Send"}
                </Button>
            </div>

        </div>
        </div>
    );
};

export default ChatWindow;