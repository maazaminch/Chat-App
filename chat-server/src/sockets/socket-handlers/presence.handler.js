export const presenceHandler = async (io) => {
    const sockets = await io.fetchSockets();

    const uniqueUsers = new Map();

    sockets.forEach((socket) => {
        uniqueUsers.set(socket.data.userId, {
            userId: socket.data.userId,
            name: socket.data.name
        });
    });

    io.emit("users:online", [...uniqueUsers.values()]);
};
