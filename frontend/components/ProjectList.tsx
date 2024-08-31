"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiAlertTriangle } from "react-icons/fi";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProjectCard from "./ProjectCard";
import SkeletonProject from "@/components/SkeletonProject";
import WelcomeMessage from "@/components/WelcomeMessage";

interface Project {
  id: string;
  name: string;
  createdat: string;
  message: string;
}

interface ProjectListProps {
  projects: Project[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, isLoading, isError }) => {
  return (
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
      ) : projects && projects.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <AnimatePresence>
            {projects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <WelcomeMessage />
      )}
    </ScrollArea>
  );
};

export default ProjectList;