import { z } from "zod";
import supabase from "../utils/supabase";
import { blogQueue } from "../utils/queue";
import { randomUUID } from "crypto";

const Input = z.array(z.object({
    project_uuid: z.string(),
    backlink: z.string().url(),
    primary_keyword: z.string().url(),
    seconday_keyword: z.string().url(),
    dr_0_30: z.string(),
    dr_30_60: z.string(),
    dr_60_100: z.string(),
    industry: z.string()
}))

export default async function createProjectBacklinks(input: z.infer<typeof Input>): Promise<Error | null> {
    const result = Input.parse(input)
    if (result) {
        for (const project of result) {
            const backlink_uuid = randomUUID()
            const backlink_data = {
                uuid: backlink_uuid,
                project_uuid: project.project_uuid,
                backlink: project.backlink,
                primary_keyword: project.primary_keyword,
                seconday_keyword: project.seconday_keyword,
                dr_0_30: parseInt(project.dr_0_30),
                dr_30_60: parseInt(project.dr_30_60),
                dr_60_100: parseInt(project.dr_60_100),
                industry: project.industry
            }
            const { error: backlinkError } = await supabase.from("backlink").insert(backlink_data)
            blogQueue.add("create-blog", { ...backlink_data }, { jobId: backlink_uuid })
            if (backlinkError instanceof Error) {
                return new Error(backlinkError.message)
            }
        }
    }
    return Error("invalid input")
}