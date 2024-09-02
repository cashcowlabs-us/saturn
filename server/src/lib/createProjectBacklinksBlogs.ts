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
        const project = await supabase.from("project").select("*").eq("id", result.project_uuid).single();
        if (backlink.error) {
            return new Error(`E001: Failed to get project: ${backlink.error.message}`);
        }

        // Call the createBlogPost function
        const previousBlog = await redis.get("previousBlog");
        const prompt = ` 
Create a Blog [400-600 words], metaTitle [1 line title strictly], metaDescription [1-2 liners], that blends SEO best practices with a warm, engaging tone. 
-----------------------------------------------------------------
Here is a previous blog that we generated for you: ${previousBlog}
-----------------------------------------------------------------
Start by identifying common questions and concerns your target audience has from the keywords:

Primary keyword: ${backlink.data.primary_keyword}

Secondary keyword: ${backlink.data.seconday_keyword}

Use natural, everyday language to make your points, avoiding jargon unless it's widely understood by your readers. Incorporate relatable examples and personal stories to illustrate your advice, making the content feel like a conversation with a knowledgeable friend. Incorporate keywords smoothly into your text, ensuring they enhance rather than disrupt the flow. Use them in headings, subheadings, and throughout the body in a way that feels natural. Break down complex ideas with bullet points, numbered lists, and bold text to make the content easily scannable for readers and search engines alike. 

Incorporate relevant keywords where appropriate. Encourage reader interaction by posing questions, inviting comments, and suggesting social shares. This not only boosts engagement but also signals to search engines that your content is valuable and engaging. Finally, keep your content up-to-date. Regular updates signal to search engines that your site is relevant, and it gives you the opportunity to refresh your SEO efforts and deepen your connection with readers.
`;

        const res = await contentGenerator.generateContent(prompt,
            {
                "name": "blog_generation",
                "schema": {
                    "type": "object",
                    "properties": {
                        "meta_title": { "type": "string" },
                        "meta_description": { "type": "string" },
                        "title": { "type": "string" },
                        "body": { "type": "string" }
                    },
                    "required": [
                        "meta_title",
                        "meta_description",
                        "title",
                        "body"
                    ]
                },
            }, project.data?.token || 300);
        if (res instanceof Error) {
            return new Error(`E002: Failed to generate content: ${res.message}`);
        }
        console.log(JSON.stringify(res.choices[0].message.content));
        const resJson = await JSON.parse(res.choices[0].message.content);
        await redis.set("previousBlog", resJson.body);
        console.log(resJson);

        const { error } = await supabase.from("blogs").insert({
            content: resJson.body,
            title: resJson.title,
            id: randomUUID(),
            created_at: new Date().toISOString(),
            backlink_uuid: result.backlink_uuid,
            project_uuid: result.project_uuid,
            meta_description: resJson.meta_description,
            meta_title: resJson.meta_title,
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
