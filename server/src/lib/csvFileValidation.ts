import { z } from "zod";

const Output = z.object({
    name: z.string(),
    token: z.number(),
    data: z.array(z.object({
        backlink: z.string().url(),
        primary_keyword: z.string().url(),
        seconday_keyword: z.string().url(),
        dr_0_30: z.string(),
        dr_30_60: z.string(),
        dr_60_100: z.string(),
        industry: z.string(),
    })).min(1)
})

export default function csvInputValidation(input: any): Error | z.infer<typeof Output> {
    try {
        let result = Output.parse(input)
        return result
    } catch (error) {
        let err = error as { message: string }
        let res = new Error(`Invalid input | ${err.message}`)
        return res
    }
}