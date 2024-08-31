"use client";


import React, { useState, ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import { FiCheck, FiFileText } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import config from "@/lib/config";

export interface CSVRow {
  Primary: string;
  Keyword: string;
  Secondary: string;
  "DR-0-30": string;
  "DR-30-60": string;
  "DR-60-100": string;
  Industry: string;
}


export interface WebsiteRow {
  Site: string;
  Username: string;
  Password: string;
  DR: string;
  Industry: string;
}

interface FileUploadSectionProps {
  setCsvData: React.Dispatch<React.SetStateAction<CSVRow[]>>;
  setWebsiteData: React.Dispatch<React.SetStateAction<WebsiteRow[]>>;
  csvData: CSVRow[];
  websiteData: WebsiteRow[];
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  refetch: () => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  setCsvData,
  setWebsiteData,
  csvData,
  websiteData,
  name,
  setName,
  refetch,
}) => {
  const [fileName, setFileName] = useState<string>("");
  const [websiteFileName, setWebsiteFileName] = useState<string>("");

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

  const websiteMutation = useMutation({
    mutationFn: async (data: WebsiteRow[]) => {
      data.pop();
      const response = await fetch(`${config.backendUrl}/websites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

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

  const handleWebsiteFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setWebsiteFileName(file.name);
      Papa.parse<string[]>(file, {
        complete: (results) => {
          const [headers, ...rows] = results.data;
          const processedData: WebsiteRow[] = rows.map((row) => {
            const obj: Partial<WebsiteRow> = {};
            (headers as Array<keyof WebsiteRow>).forEach((header, index) => {
              obj[header.trim() as keyof WebsiteRow] = row[index];
            });
            return obj as WebsiteRow;
          });
          setWebsiteData(processedData);
        },
        header: false,
      });
    }
  };

  const handleSubmit = () => {
    mutation.mutate(csvData);
  };

  const handleWebsiteSubmit = () => {
    websiteMutation.mutate(websiteData);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="project-csv">Project CSV</Label>
          <Input id="project-csv" type="file" accept=".csv" onChange={handleFileUpload} />
          {fileName && (
            <p className="text-sm text-gray-600 mt-2">
              <FiFileText className="mr-1 inline-block" /> {fileName}
            </p>
          )}
        </div>
        <Button onClick={handleSubmit} className="mt-2 w-full">
          <FiCheck className="mr-2" /> Submit Project CSV
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="website-csv">Website CSV</Label>
          <Input id="website-csv" type="file" accept=".csv" onChange={handleWebsiteFileUpload} />
          {websiteFileName && (
            <p className="text-sm text-gray-600 mt-2">
              <FiFileText className="mr-1 inline-block" /> {websiteFileName}
            </p>
          )}
        </div>
        <Button onClick={handleWebsiteSubmit} className="mt-2 w-full">
          <FiCheck className="mr-2" /> Submit Website CSV
        </Button>
      </div>
    </div>
  );
};

export default FileUploadSection;