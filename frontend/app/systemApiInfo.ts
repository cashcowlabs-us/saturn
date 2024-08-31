import { useQuery } from "@tanstack/react-query";
import config from "../lib/config";

// Fetch max blogs
const fetchMaxBlogs = async (tokens: number) => {
  const response = await fetch(`${config.backendUrl}/info/max-blogs/${tokens}`);
  if (!response.ok) {
    throw new Error("Failed to fetch max blogs");
  }
  const result = await response.json();
  return result.maxBlogs;
};

// Fetch days to exhaust tokens
const fetchDaysToExhaust = async (tokens: number) => {
  const response = await fetch(`${config.backendUrl}/info/days-to-exhaust/${tokens}`);
  if (!response.ok) {
    throw new Error("Failed to fetch days to exhaust");
  }
  const result = await response.json();
  return result.daysToExhaust;
};

// Fetch token usage daily
const fetchTokenUsageDaily = async () => {
  const response = await fetch(`${config.backendUrl}/info/token-usage-daily`);
  if (!response.ok) {
    throw new Error("Failed to fetch token usage daily");
  }
  const result = await response.json();
  return result.tokenUsagePerDay;
};

// Custom hook to use API info
export const useApiInfo = (tokens: number) => {
  const maxBlogsQuery = useQuery({
    queryKey: ['maxBlogs', tokens],
    queryFn: () => fetchMaxBlogs(tokens),
    enabled: tokens > 0, // Only fetch if tokens are positive
  });

  const daysToExhaustQuery = useQuery({
    queryKey: ['daysToExhaust', tokens],
    queryFn: () => fetchDaysToExhaust(tokens),
    enabled: tokens > 0, // Only fetch if tokens are positive
  });

  const tokenUsageDailyQuery = useQuery({
    queryKey: ['tokenUsageDaily'],
    queryFn: fetchTokenUsageDaily,
  });

  return {
    maxBlogs: maxBlogsQuery.data,
    daysToExhaust: daysToExhaustQuery.data,
    tokenUsageDaily: tokenUsageDailyQuery.data,
    isLoading: maxBlogsQuery.isLoading || daysToExhaustQuery.isLoading || tokenUsageDailyQuery.isLoading,
    isError: maxBlogsQuery.isError || daysToExhaustQuery.isError || tokenUsageDailyQuery.isError,
    error: maxBlogsQuery.error || daysToExhaustQuery.error || tokenUsageDailyQuery.error,
  };
};
