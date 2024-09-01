"use client";

import { useMaxBlogs } from "@/app/systemApiInfo";
import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaBlog, FaRegClock, FaExclamationTriangle, FaSpinner } from "react-icons/fa"; // Importing icons

const useDebounce = (value: number, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const InfoSection: React.FC = () => {
  const [tokens, setTokens] = useState<number>(0);
  const debouncedTokens = useDebounce(tokens, 2000); // 2000 ms = 2 seconds

  const { maxBlogs, isLoading, isError, error } = useMaxBlogs(debouncedTokens);
  

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setTokens(isNaN(value) ? 0 : value);
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center"><FaCalendarAlt className="mr-2" />Capacity Calculator</h2>
      <h4>Enter number of tokens per blog</h4>
      <input
        type="number"
        value={tokens}
        onChange={handleTokenChange}
        className="mb-4 px-4 py-2 border border-gray-300 rounded"
        placeholder="Enter tokens"
      />
      {isError && (
        <div className="flex items-center text-red-500 mb-4">
          <FaExclamationTriangle className="mr-2" />
          Error: {error?.message}
        </div>
      )}
      {isLoading && (
        <div className="flex items-center mb-4">
          <FaSpinner className="animate-spin mr-2" />
          Loading data, please wait...
        </div>
      )}
      {debouncedTokens > 0 && !isLoading && !isError && (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center space-x-2">
            <FaBlog className="text-xl" />
            <div>
              <h3 className="text-lg font-semibold">Max Blogs</h3>
              <p>{maxBlogs !== undefined ? maxBlogs : "N/A"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoSection;
