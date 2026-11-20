// Adapter Purpose
// verify(): “Is this request really from this provider?” (each provider signs differently)
// parse(): “Translate this provider’s messy format into our one clean format” (deliveryId, eventType, resourceId, text)
// The adapter should not choose a conversation. That is the generic pipeline’s job.

import { createHmac, timingSafeEqual } from "node:crypto";
import ApiError from "../../utils/apiError.js";

export const githubAdapter = {
    readHeaders(headers) {
        return {
            event: headers["x-github-event"],
            signature: headers["x-hub-signature-256"],
        };
    },

    verify({ rawBody, signature, secret }) {
        if (!Buffer.isBuffer(rawBody)) return false;

        const received = signature?.replace(/^sha256=/, "");
        if (!/^[a-f0-9]{64}$/i.test(received || "")) return false;

        const expected = createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");

        return timingSafeEqual(
            Buffer.from(received, "hex"),
            Buffer.from(expected, "hex")
        );
    },

    normalize({ event, payload }) {
        if (event !== "push") return null;

        const repository = payload.repository?.full_name;
        if (!repository || !Array.isArray(payload.commits)) {
            throw new ApiError(400, "Invalid GitHub push payload");
        }

        const pusher = payload.pusher?.name || "Someone";

        return {
            provider: "github",
            resourceId: repository.toLowerCase(),
            event: "push",
            text: `GitHub: ${pusher} pushed ${payload.commits.length} commit(s) to ${repository}.`,
        };
    },
};