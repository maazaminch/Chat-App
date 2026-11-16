import { z } from 'zod';

class convoValidator {

    static dmConversationSchema = z.object({
        params: z.object({
            userId: z
                .string()
                .min(1, 'User ID is required')
        })
    });

    static assertMemberSchema = z.object({
        params: z.object({
            convoId: z
                .string()
                .min(1, 'Conversation ID is required')
        })
    });

}

export default convoValidator;
