import { z } from "zod";
import supabase from "../utils/supabase";
import { queue } from "../utils/queue";
import { randomUUID } from "crypto";
import matchSite from "./matchSite";

function getRandomIndex<T>(array: T[]): T | Error {
    if (array.length === 0) {
        return new Error("Array cannot be empty.");
    }
    return array[Math.floor(Math.random() * array.length)];
}

const Input = z.object({
    project_uuid: z.string(),
    backlink: z.string().url(),
    primary_keyword: z.string(),
    seconday_keyword: z.string(),
    dr_0_30: z.string(),
    dr_30_60: z.string(),
    dr_60_100: z.string(),
    industry: z.string()
});

export default async function createProjectBacklinks(input: z.infer<typeof Input>): Promise<Error | void> {
    try {
        const result = Input.parse(input);
        const backlink_uuid = randomUUID();

        const { error: backlinkError } = await supabase.from("backlink").insert({
            id: backlink_uuid,
            backlink: result.backlink,
            dr_0_30: parseInt(result.dr_0_30),
            dr_30_60: parseInt(result.dr_30_60),
            dr_60_100: parseInt(result.dr_60_100),
            industry: result.industry,
            primary_keyword: result.primary_keyword,
            project_uuid: result.project_uuid,
            seconday_keyword: result.seconday_keyword
        });

        if (backlinkError) {
            return new Error(`ERR002: Failed to insert data into Supabase: ${backlinkError.message}`);
        }

        const drRanges = [
            { table: "project_dr_0_30", min: 0, max: 30, count: parseInt(result.dr_0_30) },
            { table: "project_dr_30_60", min: 30, max: 60, count: parseInt(result.dr_30_60) },
            { table: "project_dr_60_100", min: 60, max: 100, count: parseInt(result.dr_60_100) }
        ];

        for (const range of drRanges) {
            const sites = await matchSite(result.primary_keyword, result.seconday_keyword.split(","), result.industry, range.max, range.min);
            
            if (sites instanceof Error) {
                return sites;
            }
            
            for (let i = 0; i < range.count; i++) {
                const id = randomUUID();
                const siteResult = getRandomIndex(sites);
                if (siteResult instanceof Error) {
                    return siteResult;
                }
                const site_uuid = siteResult.site_uuid;
                
                const { error: insertError } = await supabase.from(range.table as any).insert({
                    id,
                    backlink_uuid: backlink_uuid,
                    project_uuid: result.project_uuid,
                    site_uuid
                });

                if (insertError) {
                    return new Error(`Failed to insert data into ${range.table}: ${insertError.message}`);
                }

                await queue.add("createBacklinkBlog", { id, project_uuid: result.project_uuid, backlink_uuid, site_uuid, table: range.table });
            }
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.map(err => err.message).join(", ");
            return new Error(`ERR003: Validation error: ${errors}`);
        }

        if (error instanceof Error) {
            return error;
        }

        return new Error("ERR004: An unexpected error occurred");
    }
}