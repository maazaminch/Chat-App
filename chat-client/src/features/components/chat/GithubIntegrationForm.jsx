import { useState } from "react";
import { useAddConversationIntegration } from "@/hooks/useConversationIntegrations";
import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";

const GithubIntegrationForm = ({ conversationId, integrations = [] }) => {
  const [resourceId, setResourceId] = useState("");
  const { addIntegration, removeIntegration } =
    useAddConversationIntegration(conversationId);

  const githubIntegrations = integrations.filter(
    (integration) => integration.provider === "github"
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedResourceId = resourceId.trim().toLowerCase();

    if (!/^[a-z\d_.-]+\/[a-z\d_.-]+$/i.test(normalizedResourceId)) {
      return;
    }

    addIntegration.mutate(
      {
        provider: "github",
        resourceId: normalizedResourceId,
        events: ["push"],
      },
      {
        onSuccess: () => setResourceId(""),
      }
    );
  };

  return (
    <section className="border-b border-gray-700 bg-gray-800 p-4 text-white">
      <h3 className="mb-1 font-semibold">GitHub repository</h3>
      <p className="mb-3 text-sm text-gray-300">
        Connect a repository to receive its push updates in this conversation.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="text"
          value={resourceId}
          onChange={(event) => setResourceId(event.target.value)}
          placeholder="owner/repository"
          aria-label="GitHub repository in owner/repository format"
          pattern="[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+"
          title="Enter a repository as owner/repository"
          required
          className="bg-gray-700 text-white"
        />
        <Button type="submit" disabled={addIntegration.isPending}>
          {addIntegration.isPending ? "Connecting..." : "Connect"}
        </Button>
      </form>

      {githubIntegrations.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-200">
            Connected repositories
          </p>
          <ul className="space-y-1 text-sm text-gray-300">
            {githubIntegrations.map((integration) => (
              <li
                key={`${integration.resourceId}-${integration.provider}`}
                className="flex items-center justify-between gap-3"
              >
                <span>
                  {integration.resourceId} ({integration.events.join(", ")})
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={removeIntegration.isPending}
                  onClick={() =>
                    removeIntegration.mutate({
                      provider: integration.provider,
                      resourceId: integration.resourceId,
                    })
                  }
                >
                  {removeIntegration.isPending &&
                  removeIntegration.variables?.resourceId === integration.resourceId
                    ? "Removing..."
                    : "Remove"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default GithubIntegrationForm;
