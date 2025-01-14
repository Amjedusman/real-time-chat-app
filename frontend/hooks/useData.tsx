import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { UserPagination } from "@/types/userTypes";
import { AxiosResponse } from "axios";

interface ReturnValues {
  data: UserPagination;
  loading: boolean;
  error: string | null;
}

function useData(url: string): ReturnValues {
  const [data, setData] = useState<UserPagination>({
    data: [],
    page: 1,
    total: 0,
    last_page: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    axiosInstance
      .get(url, {
        signal: controller.signal,
      })
      .then((response: AxiosResponse<UserPagination>) => {
        if (!ignore) {
          setData(response.data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || "An unknown error occurred");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
}

export default useData;
