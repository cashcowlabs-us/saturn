import logger from "../../utils/log";
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
            logger.error("Error in createProjectHandler:", { error: result.message });
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
        const interDbWebsite = result.website.map(e => {
            return { project_uuid: newProjectData.uuid, ...e, dr: Math.floor(e.dr) };
        })
        const {error: websiteError} =await supabase.from("sites").insert(interDbWebsite);

        if(websiteError) {
            console.error("ERR001: YESSSS Error creating project:", websiteError);
            return res.status(500).json({ error: "Failed to create project" });
        }
        
        for(const backlink of result.data) {
            queue.add("createBacklink", { project_uuid: newProjectData.uuid, ...backlink });
        }

        if (newProjectError) {
            console.error("ERR002: Error creating project:", newProjectError);
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
