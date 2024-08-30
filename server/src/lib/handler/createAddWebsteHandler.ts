import type { Request, Response } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import supabase from "../../utils/supabase";

const Input = z.array(z.object({
  url: z.string().url(),
  password: z.string(),
  username: z.string(),
  dr: z.number(),
  industry: z.string(),
}));

export async function createAddWebstePostHandler(req: Request, res: Response) {
  try {
    const result = Input.parse(req.body);
    const uuid = randomUUID();
    for(const input of result) {
        supabase.from("sites").insert({
            dr: input.dr,
            industry: input.industry,
            password: input.password,
            url: input.url,
            username: input.username,
            id: uuid
        })
    }
    return res.status(200).json({ success: true, message: "we are creating the website profile", id: uuid });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}