import useSWR from "swr";
import { AxiosError } from "axios";
import axiosInstance from "@/lib/axiosInstance";
import { User } from "@/types/userTypes";

interface LoginError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const fetcher = (url: string) => 
  axiosInstance.get<User>(url)
    .then((res) => res.data)
    .catch((error) => {
      if (error.response?.status === 401) {
        return null; // Return null instead of redirecting for unauthorized requests
      }
      throw error;
    });

export function useAuth() {
  const { data, mutate, error } = useSWR<User | null, AxiosError>(
    "/api/auth/user",
    fetcher,
    {
      revalidateOnFocus: false, // Prevent revalidation on window focus
      shouldRetryOnError: false // Prevent retrying on error
    }
  );

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post<User>("/api/auth/login", {
        email,
        password,
      });
      await mutate(response.data);
      return response.data;
    } catch (error: any) {
      const err = error as LoginError;
      const errorMessage = err.response?.data?.error || "Login failed";
      console.error("Login error:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    user: data,
    isLoading: !error && data === undefined,
    isError: !!error,
    login,
  };
}
