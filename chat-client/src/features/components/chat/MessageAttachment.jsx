import { useEffect, useState } from "react";
import { useMessageAttachment } from "@/hooks/useUploadAttachment";
import { File } from 'lucide-react'

export const MessageAttachment = ({messageId, attachment}) => {
    const {
        file,
        isLoading,
        error
    } = useMessageAttachment(messageId)

    const [fileUrl, setFileUrl] = useState(null)

    useEffect(() => {
        if (!file) return;


        const url = URL.createObjectURL(file);
        setFileUrl(url);

        return () => URL.revokeObjectURL(url)
    }, [file]);

    if (isLoading) return <p>Loading attachment...</p>;
    if (error || !fileUrl) return <p>Could not load attachment.</p>;

    if(attachment.mimeType.startsWith('image/')) {
        return (
            <a href={fileUrl} target="_blank" rel="noreferrer">
                <img 
                    src={fileUrl} 
                    alt={attachment.originalName}  
                    className="max-w-64 rounded"
                />
            </a>    
    )}
    

    if (attachment.mimeType.startsWith("video/")) {
    return (
    <div>
      <video src={fileUrl} controls className="max-w-64 rounded" />
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block text-sm underline"
      >
        
      </a>
    </div>      
    )}

    if (attachment.mimeType === "application/pdf") {
    return (
        <div className="flex">
        <File size={24} color="red" strokeWidth={2} />
        <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block text-sm underline"
        >
        {attachment.originalName}
        </a>
        </div>
    );
    }

    return <p>{attachment.originalName}</p>;

}