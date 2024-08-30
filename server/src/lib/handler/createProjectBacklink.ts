import createProjectBacklinksValidation from "../createProjectPointsValidation";
import type { Request, Response } from "express";


export default async function createProjectBacklinksHandler(req: Request, res: Response) {
  try {
      const validationResult = await createProjectBacklinksValidation(req.body);

      if (validationResult.success) {
          return res.status(200).json({ message: "Project points created successfully" });
      } else {
          // Determine the status code based on the error message
          if (validationResult.error?.includes('Validation error')) {
              return res.status(400).json({ error: validationResult.error });
          }
          if (validationResult.error?.includes('Failed to enqueue the job') || validationResult.error?.includes('Failed to insert data into Supabase')) {
              return res.status(500).json({ error: validationResult.error });
          }
          return res.status(400).json({ error: validationResult.error });
      }
  } catch (error) {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: "An unexpected error occurred" });
  }
}
