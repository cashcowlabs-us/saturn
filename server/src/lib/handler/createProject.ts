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
                createdat: new Date().toISOString(), // Use ISO string for timestamps
                name: newProjectData.name,
                id: newProjectData.uuid,
                status: "initialization",
            });

        if (newProjectError) {
            console.error("Error creating project:", newProjectError);
            return res.status(500).json({ error: "Failed to create project" });
        }

        return res.status(200).json({
            uuid: newProjectData.uuid,
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
}
