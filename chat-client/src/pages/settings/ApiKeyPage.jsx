import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useApiKey } from "@/hooks/useApiKey";
import { Button } from "@/features/ui/button";

const ApiKeyPage = () => {
  const { status, generate, revoke } = useApiKey();
  const [copied, setCopied] = useState(false);
  const generatedKey = generate.data?.apiKey;
  const isPending = generate.isPending || revoke.isPending;

  const handleGenerate = () => {
    if (
      status.data?.active &&
      !window.confirm("Generating a new key will stop the current key from working. Continue?")
    ) {
      return;
    }

    setCopied(false);
    generate.mutate();
  };

  const handleRevoke = () => {
    if (window.confirm("Revoke your API key? Apps using it will stop working.")) {
      revoke.mutate();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      toast.success("API key copied");
    } catch {
      toast.error("Could not copy the API key. Select and copy it manually.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">API key settings</h1>
          <Button asChild variant="outline" className='text-black'>
            <Link to="/chat">Back to chat</Link>
          </Button>
        </div>

        <section className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-5">
          <p className="text-sm text-gray-300">
            An API key lets an external app access the API as your account.
            Keep it private.
          </p>

          {status.isLoading && (
            <p className="text-sm text-gray-300">Checking API key status...</p>
          )}

          {status.isError && (
            <p role="alert" className="text-sm text-red-300">
              Could not load API key status. Please refresh and try again.
            </p>
          )}

          {status.isSuccess && (
            <div className="text-sm text-gray-200">
              {status.data.active ? (
                <>
                  <p>
                    Active key: <code>{status.data.apiKeyPrefix}</code>
                  </p>
                  {status.data.createdAt && (
                    <p className="mt-1 text-gray-400">
                      Created {new Date(status.data.createdAt).toLocaleString()}
                    </p>
                  )}
                </>
              ) : (
                <p>No API key is currently active.</p>
              )}
            </div>
          )}

          {generatedKey && (
            <div className="space-y-2 rounded border border-yellow-600 bg-gray-900 p-3">
              <p className="text-sm text-yellow-200">
                Copy this key now. It will not be shown again.
              </p>
              <code className="block break-all text-sm">{generatedKey}</code>
              <Button type="button" onClick={handleCopy}>
                {copied ? "Copied" : "Copy key"}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isPending || status.isLoading || status.isError}
            >
              {generate.isPending
                ? "Generating..."
                : status.data?.active
                  ? "Generate replacement key"
                  : "Generate API key"}
            </Button>

            {status.data?.active && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRevoke}
                disabled={isPending}
              >
                {revoke.isPending ? "Revoking..." : "Revoke key"}
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-400">
            Generating a replacement invalidates the previous key. Revoking a
            key stops apps using it from accessing your data.
          </p>
        </section>
      </div>
    </main>
  );
};

export default ApiKeyPage;
