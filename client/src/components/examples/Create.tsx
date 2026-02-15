import Create from '../../pages/Create';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

export default function CreateExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <Create />
      <Toaster />
    </QueryClientProvider>
  );
}
