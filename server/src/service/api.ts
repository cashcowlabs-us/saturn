/*
API Gateway:
   - Acts as a single entry point for all client-side requests.
   - Routes requests to appropriate microservices.
   - Handles load balancing, caching, and security (authentication/authorization).
   - Implemented using Express.js or a specialized API Gateway like Kong.
*/

import express from "express";
import type { Request, Response } from 'express';
import csvInputValidation from "../lib/csvFileValidation";
import config from "../utils/config";
import supabase from "../utils/supabase";
import { randomUUID } from "crypto";
import createProjectBacklinks from "../lib/createProjectPoints";
import matchSite from "../lib/matchSite";

const app = express();
app.use(express.json());

app.post("/create-project", async (req: Request, res: Response) => {
  try {
    const result = csvInputValidation(req.body);
    if (result instanceof Error) {
      return res.status(400).json({ error: result.message });
    }

    const newProjectData = { name: result.name, uuid: randomUUID() };
    const { error: newProjectError } = await supabase
      .from("project")
      .insert({
        createdat: Date.now().toString(),
        name: newProjectData.name,
        id: newProjectData.uuid,
        status: "initialization",
      });

    if (newProjectError) {
      console.error("Error creating project:", newProjectError);
      return res.status(500).json({ error: "Failed to create project" });
    }

    return res.status(200).json({
      uuid: newProjectData.uuid,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.post("/create-project-backlink", async (req: Request, res: Response) => {
  try {
    const err = createProjectBacklinks(req.body);
    if (err instanceof Error) {
      console.error("Error creating project points:", err);
      return res.status(400).json({ error: err.message });
    }
    return res.status(200).json({ message: "Project points created successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.post("/match-sites", (req, res) => {
  const result = matchSite(req.body)
  if (result instanceof Error) {
    return res.status(400).send(result.message)
  }
});

app.get("/scrape-site", (req, res) => {
  // Scrape specific site for description
});

app.post("/generate-content", (req, res) => {
  // Generate blog content
});

app.post("/publish-blog", (req, res) => {
  // Publish blog to specified site
});

app.listen(config.port, () => {
  console.log(`http://${config.host}:${config.port}/`);
})

export default app;

