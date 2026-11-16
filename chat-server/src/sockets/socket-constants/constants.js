const constants = {
    // User-specific room for DMs (at prod level we use userId here)
    USER_ROOM: (userId) => `user:${userId}`
}

export default constants
