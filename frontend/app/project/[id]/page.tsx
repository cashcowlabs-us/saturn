"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card"; // Assuming Shadcn Card component
import config from "@/lib/config"; // Assuming you have a config file for backendUrl

export default function Page() {
    const params = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['projects', params.id],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/project/${params.id}`);

            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }
            return response.json();
        },
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Project {params.id}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.data?.map((project: any) => (
                    <Card key={project.id} className="shadow-md">
                        <CardHeader>
                            <h2 className="text-xl font-semibold">{project.title}</h2>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-800">{project.content}</p>
                            <p className="text-gray-800">Created at: {new Date(project.created_at).toLocaleDateString()}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
