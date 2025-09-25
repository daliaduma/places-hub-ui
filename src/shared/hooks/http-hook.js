import { useCallback, useEffect, useRef, useState } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    async (url, opt = { method: "GET" }, file) => {
      setIsLoading(true);

      // cancel incoming requests if page has been loaded before completing any previous active request
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);
      try {
        if (
          (opt.method === "POST" ||
            opt.method === "PUT" ||
            opt.method === "PATCH") &&
          !file
        ) {
          opt.headers = {
						...opt.headers,
            "Content-Type": "application/json",
          };
        }

        const response = await fetch(process.env.REACT_APP_BACKEND_URL + url, {
          ...opt,
          signal: httpAbortCtrl.signal,
        });
        const responseData = await response.json();

        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl,
        );

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        return responseData;
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
        throw error;
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  const clearError = () => setError(null);

  return { isLoading, error, sendRequest, clearError };
};
