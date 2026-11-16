import { z } from 'zod';

class adminValidator {

    static banUserSchema = z.object({
        params: z.object({
            userId: z
                .string()
                .min(1, 'User ID is required')
        })
    });

    static deleteMessageSchema = z.object({
        params: z.object({
            messageId: z
                .string()
                .min(1, 'Message ID is required')
        })
    });

    static getAllConversationsSchema = z.object({
        query: z.object({
            page: z
                .string()
                .optional()
                .transform((val) => val ? parseInt(val) : 1)
                .refine((val) => val >= 1, 'Page must be at least 1'),
            limit: z
                .string()
                .optional()
                .transform((val) => val ? parseInt(val) : 20)
                .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100')
        }).optional()
    });

}

export default adminValidator;