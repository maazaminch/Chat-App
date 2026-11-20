import env from "../../config/env.js";
import { githubAdapter } from "./github.adapter.js";

export const providers = {
    github: {
        adapter: githubAdapter,
        secret: env.GITHUB_WEBHOOK_SECRET
    }
}