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

    static addIntegrationSchema = z.object({
        params: z.object({
            convoId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid conversation ID")
        }),
        body: z.object({
            provider: z.literal("github"),
            resourceId: z.string()
                .trim()
                .regex(/^[a-z\d_.-]+\/[a-z\d_.-]+$/i, "Use owner/repository format"),
            events: z.array(z.enum(["push"])).min(1)
        })
    });

    static removeIntegrationSchema = z.object({
        params: z.object({
            convoId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid conversation ID")
        }),
        body: z.object({
            provider: z.literal("github"),
            resourceId: z.string()
                .trim()
                .regex(/^[a-z\d_.-]+\/[a-z\d_.-]+$/i, "Use owner/repository format")
        })
    });

}

export default convoValidator;
