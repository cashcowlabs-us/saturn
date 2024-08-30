import { z } from "zod";

// Define the input schema
const Input = z.object({
    id: z.string().uuid(),
    project_uuid: z.string().uuid(),
    backlink_uuid: z.string().uuid(),
    site_uuid: z.string().uuid(),
    table: z.string()
});

// Assuming createBlogPost is imported or defined elsewhere
import createBlogPost from "../utils/fetch/createBlog";
import supabase from "../utils/supabase";
import redis from "../utils/redis";

export default async function createProjectBacklinksBlogs(input: z.infer<typeof Input>): Promise<Error | null> {
    try {
        // Validate the input
        const result = Input.parse(input);

        // Call the createBlogPost function
        const previousBlog = await redis.get("previousBlog")
        const res = await createBlogPost(`Here is a previous blog ${previousBlog} \nCreate a blog post with the title: ${result} and the content: ${result.site_uuid}`);
        redis.set("previousBlog", result.site_uuid);

        supabase.from("blogs").insert({
            content: res,
            title: "Create a blog post with the title: " + result.site_uuid + " and the content: " + result.site_uuid,
            blog_uuid: result.site_uuid,
            created_at: new Date().toISOString()
        })

        // If everything succeeds, return null
        return null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle Zod validation errors
            const errorMessages = error.errors.map(err => err.message).join(", ");
            return new Error(`Input validation failed: ${errorMessages}`);
        }

        if (error instanceof Error) {
            // Handle other known errors
            return new Error(`Failed to create blog post: ${error.message}`);
        }

        // Handle unexpected errors
        return new Error("An unexpected error occurred while creating the blog post");
    }
}