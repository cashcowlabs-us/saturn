import React, { useState, ChangeEvent, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import { FiCheck, FiFileText, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import config from "@/lib/config";
import { Alert, AlertDescription } from "./ui/alert";
import { useMaxBlogs } from "@/app/systemApiInfo";
import { FaSpinner } from 'react-icons/fa';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [totalBlogs, setTotalBlogs] = useState<number>(0);
  const [deficit, setDeficit] = useState<number>(0);

  const { maxBlogs, isLoading: isMaxBlogsLoading, isError: isMaxBlogsError, error: maxBlogsError } = useMaxBlogs(token || 0);

  const mutation = useMutation({
    mutationFn: async (data: {
      name: string;
      token: number;
      data: ProjectData[];
      website: WebsiteData[];
    }) => {
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

    if (isDataValid && !isMaxBlogsLoading && !isMaxBlogsError) {
      // Calculate total blogs
      const calculatedTotalBlogs = projectData.reduce((acc, project) => {
        const dr0_30 = parseInt(project.dr_0_30, 10) || 0;
        const dr30_60 = parseInt(project.dr_30_60, 10) || 0;
        const dr60_100 = parseInt(project.dr_60_100, 10) || 0;

        return acc + dr0_30 + dr30_60 + dr60_100;
      }, 0);

      setTotalBlogs(calculatedTotalBlogs);

      // Calculate deficit
      if (maxBlogs !== undefined) {
        setDeficit(calculatedTotalBlogs > maxBlogs ? calculatedTotalBlogs - maxBlogs : 0);
      }
    }
  }, [name, token, projectData, websiteData, maxBlogs, isMaxBlogsLoading, isMaxBlogsError]);

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
      <Alert className="mt-2 mb-4 bg-yellow-50 border-yellow-200 text-yellow-800 shadow-lg rounded-lg">
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
            className="border-gray-300 shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-csv">Project CSV</Label>
          <AlertComponent show={showAlerts.projectCsv} setShow={(show) => setShowAlerts(prev => ({ ...prev, projectCsv: show }))}>
            <div>Upload a CSV file containing your project data. For reference, we've provided a sample Excel file <a className="text-blue-500 hover:underline" href="https://docs.google.com/spreadsheets/d/1r-Ce5F2pA4G-6R7u-_hQJUbyOfCzCcBQsJfQo_jgww8/edit?gid=362884328#gid=362884328">here</a>.</div>
          </AlertComponent>
          <Input id="project-csv" type="file" accept=".csv" onChange={handleProjectFileUpload} />
          {projectFileName && (
            <p className="text-sm text-gray-600 mt-2 flex items-center">
              <FiFileText className="mr-1 text-gray-400" /> {projectFileName}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="website-csv">Website CSV</Label>
          <AlertComponent show={showAlerts.websiteCsv} setShow={(show) => setShowAlerts(prev => ({ ...prev, websiteCsv: show }))}>
            <div>Upload a CSV file containing website data. For reference, we've provided a sample Excel file <a className="text-blue-500 hover:underline" href="https://docs.google.com/spreadsheets/d/1r-Ce5F2pA4G-6R7u-_hQJUbyOfCzCcBQsJfQo_jgww8/edit?gid=362884328#gid=362884328">here</a>.</div>
          </AlertComponent>
          <Input id="website-csv" type="file" accept=".csv" onChange={handleWebsiteFileUpload} />
          {websiteFileName && (
            <p className="text-sm text-gray-600 mt-2 flex items-center">
              <FiFileText className="mr-1 text-gray-400" /> {websiteFileName}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <AlertComponent show={showAlerts.projectCsv} setShow={(show) => setShowAlerts(prev => ({ ...prev, projectCsv: show }))}>
            <div>Controlls the length of the blogs</div>
          </AlertComponent>
          <Input
            id="token"
            type="number"
            value={token || ""}
            onChange={(e) => setToken(parseInt(e.target.value))}
            placeholder="Enter token"
            className="border-gray-300 shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Blog Generation Summary</h3>
          {isMaxBlogsLoading ? (
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-8 rounded-md">
                <FaSpinner className="animate-spin" />
              </Skeleton>
            </div>
          ) : (
            <div className="space-y-2 p-4 rounded-md">
              <p className="text-lg font-semibold">Total blogs to be generated: <span className="font-normal">{totalBlogs}</span></p>
              {maxBlogs !== undefined && (
                <div className="space-y-1">
                  <p className="text-lg font-semibold">Maximum Blogs we can generate with current api keys: <span className="font-normal">{maxBlogs}</span></p>
                  {deficit > 0 ? (
                    <p className="text-red-600">Deficit: <span className="font-medium">{deficit}</span></p>
                  ) : (
                    <p className="text-green-600">Within Allowable Limit</p>
                  )}
                </div>
              )}
              {isMaxBlogsError && (
                <p className="text-red-600 font-medium">Error: {maxBlogsError?.message}</p>
              )}
            </div>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`w-full py-2 text-white font-semibold rounded-lg bg-black`}
        >
          {mutation.isPending ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </div>
  );
};

export default FileUploadSection;
