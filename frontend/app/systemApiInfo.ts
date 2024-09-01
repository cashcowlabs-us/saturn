import { useQuery } from "@tanstack/react-query";
import config from "../lib/config";

// Fetch max blogs
const fetchMaxBlogs = async (tokensPerBlog: number) => {
  const response = await fetch(`${config.backendUrl}/info/cal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value: tokensPerBlog }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch max blogs");
  }
  const result = await response.json();
  return result.value;
};

// Custom hook to use API info
export const useMaxBlogs = (tokensPerBlog: number) => {
  const maxBlogsQuery = useQuery({
    queryKey: ['maxBlogs', tokensPerBlog],
    queryFn: () => fetchMaxBlogs(tokensPerBlog),
    enabled: tokensPerBlog > 0, // Only fetch if tokensPerBlog is positive
  });

  console.log("maxBlogsQuery:", maxBlogsQuery.data);
  

  return {
    maxBlogs: maxBlogsQuery.data,
    isLoading: maxBlogsQuery.isLoading,
    isError: maxBlogsQuery.isError,
    error: maxBlogsQuery.error,
  };
};
