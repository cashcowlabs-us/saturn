"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import config from "@/lib/config";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw, FiCalendar, FiArrowRight, FiBox } from "react-icons/fi";
import { 
  RiRocketLine, 
  RiLightbulbFlashLine, 
  RiSearchEyeLine, 
  RiBarChartBoxLine, 
  RiTrophyLine, 
  RiToolsLine, 
  RiLineChartLine, 
  RiFlag2Line 
} from "react-icons/ri";

const projectIcons = [
  RiRocketLine, 
  RiLightbulbFlashLine, 
  RiSearchEyeLine, 
  RiBarChartBoxLine, 
  RiTrophyLine, 
  RiToolsLine, 
  RiLineChartLine, 
  RiFlag2Line
];

const LoadingSpinner = () => (
  <div className="flex justify-center items-center space-x-2 mt-8">
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <FiRefreshCw className="w-8 h-8 text-blue-500" />
    </motion.span>
    <span className="text-xl font-semibold text-gray-700">Generating...</span>
  </div>
);

const ProjectSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className="bg-gray-200 h-16" />
    <CardContent className="pt-4">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardContent>
    <CardFooter className="bg-gray-100 flex justify-between items-center">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-8 w-20" />
    </CardFooter>
  </Card>
);

export default function Page() {
  const params = useParams();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projects', params.id],
    queryFn: async () => {
      const response = await fetch(`${config.backendUrl}/project/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGenerating(true);
      setTimeout(() => setIsGenerating(false), 3000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsGenerating(true);
    refetch().then(() => setIsGenerating(false));
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <motion.div 
        className="bg-white rounded-lg p-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center mb-4">
          <FiBox className="mr-2" />
          Project {params.id}
        </h1>
        <Alert>
          <AlertDescription>
            We spread out the generation time to maximize the possible generating scenarios. New content may appear periodically.
          </AlertDescription>
        </Alert>
      </motion.div>

      <AnimatePresence>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectSkeleton />
              </motion.div>
            ))
          ) : error ? (
            <div className="col-span-full">
              <Alert variant="destructive">
                <AlertDescription>Error: {error.message}</AlertDescription>
              </Alert>
            </div>
          ) : (
            data.data?.map((project: any, index: number) => {
              const Icon = projectIcons[index % projectIcons.length];
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <h2 className="text-xl font-semibold flex items-center">
                        <Icon className="mr-2 w-6 h-6" />
                        {project.title}
                      </h2>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-gray-700">{project.content}</p>
                    </CardContent>
                    <CardFooter className="bg-gray-50 flex justify-between items-center">
                      <p className="text-sm text-gray-600 flex items-center">
                        <FiCalendar className="mr-1" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        Details <FiArrowRight className="ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
      
      {isGenerating && <LoadingSpinner />}

      <div className="mt-8 flex justify-center">
        <Button onClick={handleRefresh} disabled={isLoading || isGenerating} className="flex items-center">
          <FiRefreshCw className="mr-2" />
          Refresh Projects
        </Button>
      </div>
    </div>
  );
}