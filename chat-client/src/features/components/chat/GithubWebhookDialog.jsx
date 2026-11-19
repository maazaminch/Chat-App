import { useGithubWebhook } from "@/hooks/useGithubWebhook";
import { Button } from "@/features/ui/button";

const GithubWebhookDialog = ({ conversationId, open, onClose }) => {
  const { createGithubWebhook } = useGithubWebhook();
  const integration = createGithubWebhook.data;

  if (!open) return null;

  const copyValue = async (value) => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-lg bg-gray-800 p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">GitHub integration</h2>
          <Button type="button" onClick={onClose}>Close</Button>
        </div>

        {!integration ? (
          <>
            <p className="mb-4 text-sm text-gray-300">
              Create a webhook for this conversation, then add its URL and
              secret to your GitHub repository settings.
            </p>
            <Button
              type="button"
              onClick={() => createGithubWebhook.mutate(conversationId)}
              disabled={createGithubWebhook.isPending}
            >
              {createGithubWebhook.isPending ? "Creating..." : "Create webhook"}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Copy the secret now and add it with the webhook URL in GitHub.
            </p>

            <div>
              <p className="mb-1 text-sm">Webhook path</p>
              <div className="flex gap-2">
                <code className="min-w-0 flex-1 break-all rounded bg-gray-700 p-2 text-sm">
                  {integration.webhookPath}
                </code>
                <Button
                  type="button"
                  onClick={() => copyValue(integration.webhookPath)}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm">Secret</p>
              <div className="flex gap-2">
                <code className="min-w-0 flex-1 break-all rounded bg-gray-700 p-2 text-sm">
                  {integration.secret}
                </code>
                <Button
                  type="button"
                  onClick={() => copyValue(integration.secret)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GithubWebhookDialog;
