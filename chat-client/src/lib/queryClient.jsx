import { QueryClient, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
// This shows the backend error toast for every 
// failed mutation, so you don’t repeat it in each hook.

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
  mutationCache: new MutationCache({
    onError: (error) => toast.error(error.message), // backend message
  }),
});