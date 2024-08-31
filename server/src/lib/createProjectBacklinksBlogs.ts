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
        const backlink = await supabase.from("backlink").select("*").eq("id", result.backlink_uuid).single();
        if (backlink.error) {
            return new Error(`E001: Failed to get project: ${backlink.error.message}`);
        }

        // Call the createBlogPost function
        const previousBlog = await redis.get("previousBlog");
        const prompt = `Make sure to generate no extra text. Create a blog post using the primary keyword: ${backlink.data.industry} and the secondary keyword: ${backlink.data.seconday_keyword}. The blog post should include a title and body. Return the result in JSON format with the following structure:
        {
          "title": "Your blog post title here",
          "body": "Your blog post content here"
        }`;

        const res = await contentGenerator.generateContent(previousBlog + prompt);
        if (res instanceof Error) {
            return new Error(`E002: Failed to generate content: ${res.message}`);
        }
        const resJson =  JSON.parse(res);
        await redis.set("previousBlog", res);

        const { error } = await supabase.from("blogs").insert({
            content: resJson["body"],
            title: resJson["title"],
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
