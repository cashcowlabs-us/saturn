import React, { useState, ChangeEvent, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import { FiCheck, FiFileText, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import config from "@/lib/config";
import { Alert, AlertDescription } from "./ui/alert";

interface ProjectData {
  backlink: string;
  primary_keyword: string;
  seconday_keyword: string;
  dr_0_30: string;
  dr_30_60: string;
  dr_60_100: string;
  industry: string;
}

interface WebsiteData {
  url: string;
  password: string;
  username: string;
  dr: number;
  industry: string;
}

interface FileUploadSectionProps {
  refetch: () => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ refetch }) => {
  const [name, setName] = useState<string>("");
  const [token, setToken] = useState<number | undefined>(undefined);
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [websiteData, setWebsiteData] = useState<WebsiteData[]>([]);
  const [projectFileName, setProjectFileName] = useState<string>("");
  const [websiteFileName, setWebsiteFileName] = useState<string>("");
  const [showAlerts, setShowAlerts] = useState({
    name: true,
    projectCsv: true,
    token: true,
    websiteCsv: true,
  });
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const mutation = useMutation({
    mutationFn: async (data: {
      name: string;
      token: number;
      data: ProjectData[];
      website: WebsiteData[];
    }) => {
      console.log(data);
      const response = await fetch(`${config.backendUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    const isDataValid = name.trim() !== "" &&
      token !== undefined &&
      projectData.length > 0 &&
      websiteData.length > 0;
    setIsSubmitDisabled(!isDataValid);
  }, [name, token, projectData, websiteData]);

  const handleProjectFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProjectFileName(file.name);
      Papa.parse(file, {
        complete: (results) => {
          const [headers, ...rows] = results.data as string[][];
          const processedData = rows
            .filter(row => row.every(cell => cell.trim() !== ""))
            .map((row) => ({
              backlink: row[0],
              primary_keyword: row[1],
              seconday_keyword: row[2],
              dr_0_30: row[3],
              dr_30_60: row[4],
              dr_60_100: row[5],
              industry: row[6],
            }));
          setProjectData(processedData);
        },
        header: false,
      });
    }
  };

  const handleWebsiteFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setWebsiteFileName(file.name);
      Papa.parse(file, {
        complete: (results) => {
          const [headers, ...rows] = results.data as string[][];
          const processedData = rows
            .filter(row => row.every(cell => cell.trim() !== ""))
            .map((row) => ({
              url: row[0],
              username: row[1],
              password: row[2],
              dr: Number(row[3]),
              industry: row[4],
            }));
          setWebsiteData(processedData);
        },
        header: false,
      });
    }
  };

  const handleSubmit = () => {
    if (isSubmitDisabled) {
      return;
    }
    const data = {
      name,
      token: token!,
      data: projectData,
      website: websiteData,
    };
    mutation.mutate(data);
  };

  const AlertComponent = ({ show, setShow, children }: { show: boolean; setShow: (show: boolean) => void; children: React.ReactNode }) => (
    show && (
      <Alert className="mt-2 mb-4 bg-yellow-50 border-yellow-200 text-yellow-800">
        <AlertDescription className="flex justify-between items-start">
          {children}
          <Button
            variant="ghost"
            className="h-4 w-4 p-0 text-yellow-800 hover:bg-yellow-100"
            onClick={() => setShow(false)}
          >
            <FiX size={14} />
          </Button>
        </AlertDescription>
      </Alert>
    )
  );

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-csv">Project CSV</Label>
          <AlertComponent show={showAlerts.projectCsv} setShow={(show) => setShowAlerts(prev => ({ ...prev, projectCsv: show }))}>
            <div>Upload a CSV file containing your project data. For reference, we've provided a sample Excel file <a className="text-blue-500" href="https://docs.google.com/spreadsheets/d/1r-Ce5F2pA4G-6R7u-_hQJUbyOfCzCcBQsJfQo_jgww8/edit?gid=362884328#gid=362884328">here</a>.</div>
          </AlertComponent>
          <Input id="project-csv" type="file" accept=".csv" onChange={handleProjectFileUpload} />
          {projectFileName && (
            <p className="text-sm text-gray-600 mt-2">
              <FiFileText className="mr-1 inline-block" /> {projectFileName}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="website-csv">Website CSV</Label>
          <AlertComponent show={showAlerts.websiteCsv} setShow={(show) => setShowAlerts(prev => ({ ...prev, websiteCsv: show }))}>
            <div>Upload a CSV file containing website data. For reference, we've provided a sample Excel file <a className="text-blue-500" href="https://docs.google.com/spreadsheets/d/1r-Ce5F2pA4G-6R7u-_hQJUbyOfCzCcBQsJfQo_jgww8/edit?gid=0#gid=0">here</a>.</div>
          </AlertComponent>
          <Input id="website-csv" type="file" accept=".csv" onChange={handleWebsiteFileUpload} />
          {websiteFileName && (
            <p className="text-sm text-gray-600 mt-2">
              <FiFileText className="mr-1 inline-block" /> {websiteFileName}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <AlertComponent show={showAlerts.token} setShow={(show) => setShowAlerts(prev => ({ ...prev, token: show }))}>
            Enter the estimated token usage per blog. This represents the anticipated number of tokens required for each blog.
          </AlertComponent>
          <Input
            id="token"
            type="number"
            value={token || ''}
            onChange={(e) => setToken(Number(e.target.value))}
            placeholder="Enter token number"
          />
        </div>
        <Button onClick={handleSubmit} className="mt-2 w-full" disabled={isSubmitDisabled}>
          <FiCheck className="mr-2" /> Submit Project
        </Button>
      </div>
    </div>
  );
};

export default FileUploadSection;