"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiList, FiPlus, FiCheck, FiAlertTriangle, FiClock, FiFileText } from "react-icons/fi";
import { RiRocketLine, RiLightbulbFlashLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
  <motion.span
    className="text-4xl inline-block"
    animate={{ rotate: [0, 14, -8, 14, 0] }}
    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
  >
    👋
  </motion.span>
);

const SkeletonProject: React.FC = () => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-full" />
    </CardContent>
  </Card>
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
    onSuccess: () => {
      refetch();
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
    <main className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      <motion.div 
        className="w-full lg:w-1/2 p-4 lg:p-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle className="text-xl lg:text-2xl font-bold flex items-center">
              <FiList className="mr-2" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[50vh] lg:h-[calc(100vh-200px)]">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <SkeletonProject key={index} />
                  ))}
                </div>
              ) : isError ? (
                <Alert variant="destructive">
                  <FiAlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Failed to load projects.</AlertDescription>
                </Alert>
              ) : projects?.data && projects.data.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {projects.data.map((project: Project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        onClick={() => router.push(`project/${project.id}`)}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg lg:text-xl flex items-center">
                            <RiRocketLine className="mr-2 text-blue-500" />
                            {project.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs lg:text-sm text-gray-600 flex items-center">
                            <FiClock className="mr-1" />
                            {new Date(project.createdat).toLocaleString()}
                          </p>
                          <p className="text-xs lg:text-sm mt-2 flex items-center">
                            <FiFileText className="mr-1" />
                            {project.message}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  className="text-center p-4 lg:p-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <WavingHand />
                  <motion.p
                    className="text-lg lg:text-xl font-semibold mb-2 lg:mb-4 mt-2 lg:mt-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Welcome! No projects found
                  </motion.p>
                  <motion.p
                    className="text-sm lg:text-base text-gray-600"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Create a new project by uploading a CSV file.
                  </motion.p>
                </motion.div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      <div className="hidden lg:block w-px bg-gray-200 self-stretch mx-4" />

      <motion.div
        className="w-full lg:w-1/2 p-4 lg:p-8 flex items-center justify-center"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl lg:text-2xl font-bold flex items-center justify-center">
              <FiUpload className="mr-2" /> Upload CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div className="space-y-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <Label htmlFor="name-input">Project Name</Label>
              <Input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
              />
            </motion.div>

            <motion.div className="space-y-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
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
              <AnimatePresence>
                {fileName && (
                  <motion.p
                    className="text-xs lg:text-sm text-gray-500 mt-1 truncate"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    Selected: {fileName}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
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
            </motion.div>

            <AnimatePresence>
              {mutation.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert variant="destructive">
                    <FiAlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      An error occurred while submitting the data. Please try again.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {mutation.isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert>
                    <FiCheck className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      Data has been successfully submitted!
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}