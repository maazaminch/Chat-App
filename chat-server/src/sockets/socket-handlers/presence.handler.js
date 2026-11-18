import redis from "../../config/redis.js";

const ONLINE_USERS_KEY = 'online:users'

const userSocketsKey = (userId) => `online:user:${userId}:sockets`


// set track socket connections
// hash store online users
export const addUserToOnline = async (userId, socketId, name) => {
    await redis.sadd(userSocketsKey(userId), socketId);
    await redis.hset(ONLINE_USERS_KEY, userId, name);
}

export const removeUserFromOnline = async (userId, socketId) => {
    const key = userSocketsKey(userId);

    await redis.srem(key, socketId);

    const remainingSockets = await redis.scard(key);
    if(remainingSockets === 0){
        await redis.del(key);
        await redis.hdel(ONLINE_USERS_KEY, userId)
    }
}

export const clearOnlineUsers = async () => {
    let cursor = "0";

    do {
        const [nextCursor, keys] = await redis.scan(
            cursor,
            "MATCH",
            "online:user:*:sockets",
            "COUNT",
            100
        );

        cursor = nextCursor;

        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } while (cursor !== "0");

    await redis.del(ONLINE_USERS_KEY);
};

export const presenceHandler = async (io) => {
    const users = await redis.hgetall(ONLINE_USERS_KEY)
    
    const onlineUsers = Object.entries(users).map(([userId, name]) => ({
            userId,
            name
    }))
    
    io.emit('users:online', onlineUsers)
}



// export const presenceHandler = async (io) => {
//     const sockets = await io.fetchSockets();

//     const uniqueUsers = new Map();

//     sockets.forEach((socket) => {
//         uniqueUsers.set(socket.data.userId, {
//             userId: socket.data.userId,
//             name: socket.data.name
//         });
//     });

//     io.emit("users:online", [...uniqueUsers.values()]);
// };
