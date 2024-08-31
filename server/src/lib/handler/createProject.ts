import { queue } from "../../utils/queue";
import supabase from "../../utils/supabase";
import csvInputValidation from "../csvFileValidation";
import { randomUUID } from "crypto";
import type { Request, Response } from 'express';

export default async function createProjectHandler(req: Request, res: Response) {
    try {
        // Validate input
        const result = csvInputValidation(req.body);
        if (result instanceof Error) {
            return res.status(400).json({ error: result.message });
        }

        // Check for empty data array
        if (!result.name) {
            return res.status(400).json({ error: "Name cannot be empty" });
        }

        // Create new project data
        const newProjectData = { name: result.name, uuid: randomUUID() };
        const { error: newProjectError } = await supabase
            .from("project")
            .insert({
                createdat: new Date().toISOString(),
                message: "building",
                name: newProjectData.name,
                token: result.token,
                id: newProjectData.uuid,
            });
        
        for(const backlink of result.data) {
            queue.add("createBacklink", { project_uuid: newProjectData.uuid, ...backlink });
        }

        if (newProjectError) {
            console.error("ERR001: Error creating project:", newProjectError);
            return res.status(500).json({ error: "Failed to create project" });
        }

        return res.status(200).json({
            uuid: newProjectData.uuid,
        });
    } catch (error) {
        console.error("ERR002: Unexpected error:", error);
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
}
