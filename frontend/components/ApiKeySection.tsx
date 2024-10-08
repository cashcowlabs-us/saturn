"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ApiKeyInfo from "./ApiKeyInfo";
import config from "@/lib/config";
import AlertComponent from "./AlertComponent";

const submitApiKey = async (apiKey: string) => {
  console.log("Submitting API key:", apiKey);

  const response = await fetch(config.backendUrl + '/keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key: apiKey }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit API key');
  }
  return response.json();
};

const ApiKeySection: React.FC = () => {
  const [apiKey, setApiKey] = useState("");

  const keyMutation = useMutation({
    mutationFn: submitApiKey,
    onSuccess: () => {
      setApiKey(""); // Clear the input after successful submission
    },
  });

  const handleSubmitApiKey = () => {
    if (apiKey.trim()) {
      keyMutation.mutate(apiKey);
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <AlertComponent setShow={() => true} show={true}>
      This is your API key section. We utilize multiple API keys from *different accounts*, which is beneficial for increasing the speed of blog generation.
      The *refresh button* will help you get latest infomtion like *rate limit* and *tokens remaining*. 
      </AlertComponent>
      <div>
        <ApiKeyInfo />
        <Label htmlFor="api-key">Add Key</Label>
        <Input
          id="api-key"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="border rounded p-2 w-full"
        />
      </div>
      <Button
        onClick={handleSubmitApiKey}
        className="mt-2 w-full"
        disabled={keyMutation.status === 'pending' || !apiKey.trim()}
      >
        <FiCheck className="mr-2" />
        {keyMutation.status === 'pending' ? "Submitting..." : "Submit OpenAI Key"}
      </Button>
      {keyMutation.status === 'success' && (
        <Alert variant="default" className="mt-2">
          <AlertDescription>API key submitted successfully!</AlertDescription>
        </Alert>
      )}
      {keyMutation.status === 'error' && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>Failed to submit API key. Please try again.</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ApiKeySection;
