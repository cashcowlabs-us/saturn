"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FiList, FiSettings, FiUpload, FiX } from "react-icons/fi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import InfoSection from "@/components/SystemInfo"
import ProjectList from "@/components/ProjectList";
import FileUploadSection, { CSVRow, WebsiteRow } from "@/components/FileUploadSection";
import ApiKeySection from "@/components/ApiKeySection";
import config from "@/lib/config";

export default function Home() {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [websiteData, setWebsiteData] = useState<WebsiteRow[]>([]);
  const [name, setName] = useState<string>("");
  const [showInfo, setShowInfo] = useState(true);

  const { data: projects, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch(`${config.backendUrl}/projects`);
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    },
  });

  return (
    <main className="flex flex-col min-h-screen bg-gray-100">
      <motion.div
        className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 lg:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle className="text-xl lg:text-2xl font-bold flex items-center">
              <FiList className="mr-2" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectList projects={projects?.data} isLoading={isLoading} isError={isError} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="w-full h-full">
            <CardHeader>
              <CardTitle className="text-xl lg:text-2xl font-bold flex items-center">
                <FiUpload className="mr-2" /> Upload CSV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadSection
                setCsvData={setCsvData}
                setWebsiteData={setWebsiteData}
                csvData={csvData}
                websiteData={websiteData}
                name={name}
                setName={setName}
                refetch={refetch}
              />
            </CardContent>
          </Card>

          <Card className="w-full h-full">
            <CardHeader>
              <CardTitle className="text-xl lg:text-2xl font-bold flex items-center">
                <FiSettings className="mr-2" /> API Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoSection />
              <ApiKeySection />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </main>
  );
}