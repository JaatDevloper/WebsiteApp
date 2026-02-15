import MyQuizzes from '../../pages/MyQuizzes';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function MyQuizzesExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyQuizzes />
    </QueryClientProvider>
  );
}
