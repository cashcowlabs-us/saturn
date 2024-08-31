"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RiRocketLine } from "react-icons/ri";
import { FiClock, FiFileText } from "react-icons/fi";

interface Project {
  id: string;
  name: string;
  createdat: string;
  message: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
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
  );
};

export default ProjectCard;