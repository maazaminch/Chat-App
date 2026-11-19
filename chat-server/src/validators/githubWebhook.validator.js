import { z } from "zod";

const objectIdSchema = z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid ID");

class GithubWebhookValidator {
    static createSchema = z.object({
        params: z.object({
            conversationId: objectIdSchema,
        }),
    });

    static receiveSchema = z.object({
        params: z.object({
            integrationId: objectIdSchema,
        }),
        headers: z.object({
            "x-github-event": z.string().min(1, "GitHub event header is required"),
            "x-hub-signature-256": z
                .string()
                .regex(/^sha256=[a-f\d]{64}$/i, "Invalid GitHub signature header"),
        }),
    });

    static pushPayloadSchema = z.object({
        repository: z.object({
            full_name: z.string().min(1),
        }),
        pusher: z.object({
            name: z.string().min(1).optional(),
        }).nullable().optional(),
        commits: z.array(z.unknown()),
    });

    static rawBodySchema = z
        .instanceof(Buffer)
        .refine((body) => body.length > 0, "Webhook body is required");
}

export default GithubWebhookValidator;
