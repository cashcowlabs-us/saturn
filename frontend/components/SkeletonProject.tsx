"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

export default SkeletonProject;