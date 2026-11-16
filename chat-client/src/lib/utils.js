export { cn } from "cn"

export function formatError(error) {
    return error.response?.data?.message || error.message || 'An error occurred'
}

// Format timestamp to readable time (e.g., "10:30 AM", "5m ago", "2h ago")
export function formatTime(dateString, type = 'time') {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (type === 'relative') {
        // Return relative time (e.g., "5m ago", "2h ago")
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    } else {
        // Return absolute time (e.g., "10:30 AM")
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// Generate initials from name (e.g., "John Doe" → "JD")
export function getInitials(name) {
    if (!name) return '??';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Truncate text to specified length (e.g., "Hello world..." → "Hello wo...")
export function truncateText(text, maxLength = 35) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

