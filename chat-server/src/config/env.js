import "dotenv/config";
import { z } from "zod";


const envSchema = z.object({
        NODE_ENV: z.enum(["development", "production"]).default("development"),
        PORT: z.string().default("8000"),
        MONGO_URI: z.string().min(1, "MONGO_URI is required"),

        JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
        ACCESS_TOKEN_TTL: z.string().default("15m"),
        REFRESH_TOKEN_TTL: z.string().default("1d"),
        
        BCRYPT_COST: z.coerce.number().int().min(4).max(31).default(12),
        
        COOKIE_SECURE: z
            .enum(["true", "false"])
            .default("true")
            .transform((value) => value === "true"),

        CLIENT_URL: z.string().min(1, "CLIENT_URL is required"),
        REDIS_HOST: z.string().default("localhost"),
        REDIS_PORT: z.coerce.number().int().default(6379),

        GITHUB_WEBHOOK_SECRET: z.string().min(1),
})

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    process.exit(1);
}

const env = _env.data;

export default env;