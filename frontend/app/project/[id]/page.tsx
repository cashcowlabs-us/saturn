"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import config from "@/lib/config";
import { motion, AnimatePresence } from "framer-motion";

const emojis = ["🚀", "💡", "🔍", "📊", "🎯", "🔧", "📈", "🏆"];

const LoadingSpinner = () => (
  <div className="flex justify-center items-center space-x-2 mt-8">
    <motion.span
      className="text-4xl"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      🔄
    </motion.span>
    <span className="text-xl font-semibold">Generating...</span>
  </div>
);

export default function Page() {
  const params = useParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState("")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projects', params.id],
    queryFn: async () => {
      const response = await fetch(`${config.backendUrl}/project/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGenerating(true);
      setTimeout(() => setIsGenerating(false), 3000);
    }, 15000);


    return () => clearInterval(interval);
  }, []);


  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center mt-8">Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <motion.h1 
        className="text-3xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Project {params.id} <span className="animate-bounce inline-block">🎉</span>
      </motion.h1>
      <AnimatePresence>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {data.data?.map((project: any, index: number) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <h2 className="text-xl font-semibold flex items-center">
                    <span className="mr-2">{emojis[index % emojis.length]}</span>
                    {project.title}
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800">{project.content}</p>
                  <p className="text-gray-600 mt-2">
                    Created at: {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      {isGenerating && <LoadingSpinner />}
    </div>
  );
}``