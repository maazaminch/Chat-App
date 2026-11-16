
import { useState, useEffect, useRef } from "react";

export const useTyping = (socket, recipientId) => {
    const [isTyping, setIsTyping] = useState(false);
    const typingTimerRef = useRef(null);

    const startTyping = () => {
        if (!socket || !recipientId) return;

        // Clear existing timeout
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
        }

        // Emit typing start
        socket.emit("typing:start", recipientId);

        // Auto-stop after 2 seconds of inactivity
        typingTimerRef.current = setTimeout(() => {
            stopTyping();
        }, 2000);
    };

    const stopTyping = () => {
        if (!socket || !recipientId) return;

        // Clear timeout
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
        }

        socket.emit("typing:stop", recipientId);
    };

    useEffect(() => {
        if (!socket) return;

        const handleTypingStart = ({ userId }) => {
            if (String(userId) === String(recipientId)) setIsTyping(true);
        };

        const handleTypingStop = ({ userId }) => {
            if (String(userId) === String(recipientId)) setIsTyping(false);
        };

        socket.on("typing:start", handleTypingStart);
        socket.on("typing:stop", handleTypingStop);

        return () => {
            socket.off("typing:start", handleTypingStart);
            socket.off("typing:stop", handleTypingStop);
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
        };
    }, [socket, recipientId]);

    return { isTyping, startTyping, stopTyping };
};
