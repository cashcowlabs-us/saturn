"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { FiUpload, FiList, FiPlus, FiCheck, FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import config from "@/lib/config";

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

const WavingHand: React.FC = () => (
  <span className="waving-hand text-4xl inline-block">👋</span>
);

export default function Home() {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: CSVRow[]) => {
      data.pop();
      const response = await fetch(`${config.backendUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, data }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
  });

  const { data: projects, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch(`${config.backendUrl}/projects`);
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    },
  });

  useEffect(() => {
    refetch();
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
    <main className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-8">
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <FiList className="mr-2" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              {isLoading && <p className="text-center">Loading projects...</p>}
              {isError && <p className="text-center text-red-500">Failed to load projects.</p>}
              {projects?.data && projects?.data?.length > 0 ? (
                <div className="space-y-4">
                  {projects.data.map((project: Project) => (
                    <Card
                      key={project.id}
                      onClick={() => router.push(`project/${project.id}`)}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{new Date(project.createdat).toLocaleString()}</p>
                        <p className="text-sm mt-2">{project.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <WavingHand />
                  <p className="text-xl font-semibold mb-4 mt-4">Welcome! No projects found</p>
                  <p className="text-gray-600">Create a new project by uploading a CSV file.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="w-px bg-gray-200 self-stretch mx-4" />

      <div className="flex-1 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center justify-center">
              <FiUpload className="mr-2" /> Upload CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name-input">Project Name</Label>
              <Input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv-upload">Upload CSV</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('csv-upload')?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <FiPlus className="mr-2" /> Choose File
                </Button>
              </div>
              {fileName && (
                <p className="text-sm text-gray-500 mt-1 truncate">
                  Selected: {fileName}
                </p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={csvData.length === 0 || mutation.isPending || !name}
              className="w-full"
            >
              {mutation.isPending ? (
                <>Submitting... <FiCheck className="ml-2 animate-spin" /></>
              ) : (
                <>Submit Data <FiCheck className="ml-2" /></>
              )}
            </Button>

            {mutation.isError && (
              <Alert variant="destructive">
                <FiAlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  An error occurred while submitting the data. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {mutation.isSuccess && (
              <Alert>
                <FiCheck className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Data has been successfully submitted!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}