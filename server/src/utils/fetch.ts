import { z } from "zod";

const Input = z.object({
    backlink: z.string().url(),
    primary_keyword: z.string().url(),
    seconday_keyword: z.string().url(),
    dr_0_30: z.string(),
    dr_30_60: z.string(),
    dr_60_100: z.string(),
    industry: z.string()
})

const Site = z.object({
    site: z.string().url(),
    username: z.string(),
    password: z.string(),
    dr: z.number(),
    indistry: z.string(),
})

const Output = z.object({
    dr_0_30: z.array(Site),
    dr_30_60: z.array(Site),
    dr_60_100: z.array(Site)
})

export async function fetchMatchSite(input: z.infer<typeof Input>): Promise<Error | z.infer<typeof Output>> {
    try {
        const result = Input.parse(input)
        const dr_0_30 = await fetch("/match-sites", {
            method: "POST",
            body: JSON.stringify({
                backlink: result.backlink,
                primary_keyword: result.primary_keyword,
                seconday_keyword: result.seconday_keyword,
                dr_heigh: 30,
                dr_low: 0,
                industry: result.industry
            })
        })
        const dr_30_60 = await fetch("/match-sites", {
            method: "POST",
            body: JSON.stringify({
                backlink: result.backlink,
                primary_keyword: result.primary_keyword,
                seconday_keyword: result.seconday_keyword,
                dr_heigh: 30,
                dr_low: 0,
                industry: result.industry
            })
        })
        const dr_60_100 = await fetch("/match-sites", {
            method: "POST",
            body: JSON.stringify({
                backlink: result.backlink,
                primary_keyword: result.primary_keyword,
                seconday_keyword: result.seconday_keyword,
                dr_heigh: 30,
                dr_low: 0,
                industry: result.industry
            })
        })
        return { dr_0_30: await dr_0_30.json(), dr_30_60: await dr_30_60.json(), dr_60_100: await dr_60_100.json() };
    } catch (error) {
        let err = error as { message: string }
        let res = new Error(`Invalid input | ${err.message}`)
        return res
    }
}