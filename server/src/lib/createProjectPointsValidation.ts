import { z } from "zod";
import supabase from "../utils/supabase";
import { blogQueue } from "../utils/queue";
import { randomUUID } from "crypto";

// Define the schema for validation
const Input = z.array(z.object({
    project_uuid: z.string(),
    backlink: z.string().url(),
    primary_keyword: z.string(),
    seconday_keyword: z.string(),
    dr_0_30: z.string(),
    dr_30_60: z.string(),
    dr_60_100: z.string(),
    industry: z.string()
}));

// Validate and process the input data
export default async function createProjectBacklinksValidation(input: z.infer<typeof Input>): Promise<{ success: boolean; error?: string }> {
    try {
        // Parse and validate input
        const result = Input.parse(input);

        if (result.length === 0) {
            return { success: false, error: "Input data array cannot be empty" };
        }

        // Iterate over each project and process
        for (const project of result) {
            const backlink_uuid = randomUUID();
            const backlink_data = {
                uuid: backlink_uuid,
                project_uuid: project.project_uuid,
                backlink: project.backlink,
                primary_keyword: project.primary_keyword,
                seconday_keyword: project.seconday_keyword,
                dr_0_30: parseInt(project.dr_0_30, 10),
                dr_30_60: parseInt(project.dr_30_60, 10),
                dr_60_100: parseInt(project.dr_60_100, 10),
                industry: project.industry
            };

            // Insert data into Supabase
            const { error: backlinkError } = await supabase.from("backlink").insert(backlink_data);

            // Add job to queue
            try {
                await blogQueue.add("create-blog", { ...backlink_data }, { jobId: backlink_uuid });
            } catch (queueError) {
                console.error("Error adding job to queue:", queueError);
                return { success: false, error: "Failed to enqueue the job" };
            }

            // Handle Supabase insertion errors
            if (backlinkError) {
                console.error("Error inserting into Supabase:", backlinkError);
                return { success: false, error: `Failed to insert data into Supabase: ${backlinkError.message}` };
            }
        }
        return { success: true }; // Successful validation and processing
    } catch (error) {
        // Handle Zod validation errors specifically
        if (error instanceof z.ZodError) {
            const errors = error.errors.map(err => err.message).join(", ");
            console.error("Zod validation error:", errors);
            return { success: false, error: `Validation error: ${errors}` };
        }
        
        // Handle unexpected errors
        console.error("Unexpected error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
