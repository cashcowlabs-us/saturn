"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import config from "@/lib/config";

// Define the type for the API key info
interface ApiKeyInfo {
  id: string;
  key: string;
  message: string | null;
  requests_remaining: number;
  requests_reset_time: string;
  state: boolean;
  tokens_remaining: number;
  tokens_reset_time: string;
}

// Fetch API key info from the endpoint
const fetchApiKeyInfo = async (): Promise<ApiKeyInfo[]> => {
  const response = await fetch(`${config.backendUrl}/keys`);
  if (!response.ok) {
    throw new Error("Failed to fetch API key information");
  }
  const result = await response.json();
  return result.data.data; // Adjusted to get the `data` array from the response
};

// Fetch calibration info from the endpoint
const calibrateApi = async () => {
  const response = await fetch(`${config.backendUrl}/info/calibrate`);
  if (!response.ok) {
    throw new Error("Failed to calibrate API");
  }
  const result = await response.json();
  return result; // Adjust as needed based on the response format
};

const ApiKeyInfo: React.FC = () => {
  const [showKeys, setShowKeys] = useState(false);
  const [calibrationStatus, setCalibrationStatus] = useState<string | null>(null);

  const { data, error, isLoading } = useQuery<ApiKeyInfo[]>({
    queryKey: ['apiKeyInfo'],
    queryFn: fetchApiKeyInfo,
  });

  const mutation = useMutation({
    mutationFn: calibrateApi,
    onSuccess: () => {
      setCalibrationStatus("Calibration successful");
    },
    onError: (error: any) => {
      setCalibrationStatus(`Calibration failed: ${error.message}`);
    }
  });

  const handleCalibrate = () => {
    mutation.mutate();
  };

  const formatDate = (dateString: string | undefined) => {
    return dateString ? new Date(dateString).toLocaleString() : "N/A";
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold mb-4">API Key Information</h2>
      <div className="flex flex-row gap-2">
        <button
          onClick={() => setShowKeys(!showKeys)}
          className="mb-4 px-4 py-2 bg-black text-white rounded"
        >
          {showKeys ? "Hide Keys" : "Show Keys"}
        </button>
        <button
          onClick={handleCalibrate}
          className="mb-4 px-4 py-2 bg-black text-white rounded"
        >
          {mutation.isPending ? "Refreshing..." : "Refresh Keys"}
        </button>
      </div>
      {calibrationStatus && (
        <div className={`mb-4 ${calibrationStatus.startsWith("Calibration failed") ? "text-red-500" : "text-green-500"}`}>
          {calibrationStatus}
        </div>
      )}
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {showKeys && <th className="border px-4 py-2 min-w-[120px]">Key</th>}
                <th className="border px-4 py-2 min-w-[120px]">ID</th>
                <th className="border px-4 py-2 min-w-[120px]">Message</th>
                <th className="border px-4 py-2 min-w-[150px]">Requests Remaining</th>
                <th className="border px-4 py-2 min-w-[200px]">Requests Reset Time</th>
                <th className="border px-4 py-2 min-w-[100px]">State</th>
                <th className="border px-4 py-2 min-w-[150px]">Tokens Remaining</th>
                <th className="border px-4 py-2 min-w-[200px]">Tokens Reset Time</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-gray-50">
                  {showKeys && <td className="border px-4 py-2">{apiKey.key}</td>}
                  <td className="border px-4 py-2">{apiKey.id}</td>
                  <td className="border px-4 py-2">{apiKey.message || "N/A"}</td>
                  <td className="border px-4 py-2">{apiKey.requests_remaining}</td>
                  <td className="border px-4 py-2">{formatDate(apiKey.requests_reset_time)}</td>
                  <td className="border px-4 py-2">{apiKey.state ? "Active" : "Inactive"}</td>
                  <td className="border px-4 py-2">{apiKey.tokens_remaining}</td>
                  <td className="border px-4 py-2">{formatDate(apiKey.tokens_reset_time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApiKeyInfo;
