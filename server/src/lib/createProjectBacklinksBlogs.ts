import { z } from "zod";
import { randomUUID } from "crypto";

// Define the input schema
const Input = z.object({
    id: z.string().uuid(),
    project_uuid: z.string().uuid(),
    backlink_uuid: z.string().uuid(),
    site_uuid: z.string().uuid(),
    table: z.string()
});

// Assuming createBlogPost is imported or defined elsewhere
import supabase from "../utils/supabase";
import redis from "../utils/redis";
import { contentGenerator } from "./openapikeyManager";

export default async function createProjectBacklinksBlogs(input: z.infer<typeof Input>): Promise<Error | null> {
    try {
        // Validate the input
        const result = Input.parse(input);

        // Call the createBlogPost function
        const previousBlog = await redis.get("previousBlog");
        const res = await contentGenerator.generateContent(previousBlog + " Create a blog post with the title: " + result.site_uuid + " and the content: " + result.site_uuid);
        if (res instanceof Error) {
            return new Error(`E002: Failed to generate content: ${res.message}`);
        }
        await redis.set("previousBlog", res);

        const { error } = await supabase.from("blogs").insert({
            content: res,
            title: "Create a blog post with the title: " + result.site_uuid + " and the content: " + result.site_uuid,
            id: randomUUID(),
            created_at: new Date().toISOString(),
            backlink_uuid: result.backlink_uuid,
            project_uuid: result.project_uuid
        });

        if (error) {
            return new Error(`E003: Failed to insert blog post: ${error.message}`);
        }

        // If everything succeeds, return null
        return null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle Zod validation errors
            const errorMessages = error.errors.map(err => err.message).join(", ");
            return new Error(`E001: Input validation failed: ${errorMessages}`);
        }

        if (error instanceof Error) {
            // Handle other known errors
            return new Error(`E999: Failed to create blog post: ${error.message}`);
        }

        // Handle unexpected errors
        return new Error("E999: An unexpected error occurred while creating the blog post");
    }
}
