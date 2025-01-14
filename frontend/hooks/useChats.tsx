import useSWR from "swr";
import axiosInstance from "@/lib/axiosInstance";
import { ApiPaginationResponse } from "@/types/apiResponseTypes";
import { Chat, UseChatsReturn } from "@/types/chatTypes";

interface Error {
  message: string;
}

const fetcher = (url: string) => 
  axiosInstance.get<ApiPaginationResponse<Chat[]>>(url)
    .then((res) => res.data);

export function useChats(): UseChatsReturn {
  const { data, error, mutate } = useSWR<ApiPaginationResponse<Chat[]>, Error>(
    "/api/chats",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false
    }
  );

  return {
    chats: data,
    chatsAreLoading: !error && !data,
    chatsHasError: error,
    mutate,
  };
}
