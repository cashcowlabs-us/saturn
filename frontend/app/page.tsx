"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import config from "@/lib/config";
import { useRouter } from "next/navigation";

interface CSVRow {
  Primary: string;
  Keyword: string;
  Secondary: string;
  "DR-0-30": string;
  "DR-30-60": string;
  "DR-60-100": string;
  Industry: string;
}

interface Project {
  name: string;
  createdat: string;
  id: string;
  message: string;
}

export default function Home() {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async (data: CSVRow[]) => {
      data.pop();
      console.log(`{"name":"${name}","data": ${JSON.stringify(data)}}`);

      const response = await fetch(`${config.backendUrl}/projects`, {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
          'Content-Type': 'application/json'
        },
        body: `{"name":"${name}","data": ${JSON.stringify(data)}}`,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  const { data: projects, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch(`${config.backendUrl}/projects`);

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    },
  });

  useEffect(() => {
    refetch(); // Refetch projects when component mounts
  }, [refetch]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);

      Papa.parse<string[]>(file, {
        complete: (results) => {
          const [headers, ...rows] = results.data;
          const processedData: CSVRow[] = rows.map((row) => {
            const obj: Partial<CSVRow> = {};
            (headers as Array<keyof CSVRow>).forEach((header, index) => {
              obj[header.trim() as keyof CSVRow] = row[index];
            });
            return obj as CSVRow;
          });
          setCsvData(processedData);
        },
        header: false,
      });
    }
  };

  const handleSubmit = () => {
    mutation.mutate(csvData);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 space-y-6">
      <h1 className="text-3xl font-bold">CSV Upload and Submit</h1>

      <div className="w-full max-w-md space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name-input">Name</Label>
          <Input
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="csv-upload">Upload CSV</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
        </div>
        {fileName && (
          <p className="text-sm text-gray-500">File selected: {fileName}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={csvData.length === 0 || mutation.isPending || !name}
          className="w-full"
        >
          {mutation.isPending ? "Submitting..." : "Submit Data"}
        </Button>

        {mutation.isError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              An error occurred while submitting the data. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {mutation.isSuccess && (
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Data has been successfully submitted!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label>Project</Label>
          <div className="space-y-2">
            {isLoading && <p>Loading projects...</p>}
            {isError && <p>Failed to load projects.</p>}
            {projects?.data && projects?.data?.length > 0 && (
              projects.data.map((project: Project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    router.push(`project/${project.id}`)
                  }}
                  className={`p-4 border rounded cursor-pointer`}
                >
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="text-sm text-gray-600">{project.createdat}</p>
                  <p className="text-sm">{project.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
