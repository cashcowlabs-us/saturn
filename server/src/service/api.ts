import express from "express";
import config from "../utils/config";
import createProjectHandler from "../lib/handler/createProject";
import { createAddWebstePostHandler } from "../lib/handler/createAddWebsteHandler";
import { z } from "zod";
import { keyManager } from "../lib/openapikeyManager";
import cors from "cors";
import logger from "../utils/log";
import supabase from "../utils/supabase";

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*"
}));

const apiKeySchema = z.object({
  key: z.string().min(1, { message: 'API key is required' }),
});

app.post("/projects", async (req, res) => {
  try {
    logger.info("Received request to /project", { requestBody: req.body });
    await createProjectHandler(req, res);
    logger.info("Successfully handled /project request");
  } catch (error: any) {
    logger.error("Error in /project route:", { error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/project/:id", async (req, res) => {
  try {
    logger.info("Received request to /project/:id", { params: req.params });
    const { id } = req.params;
    const result = await supabase.from("blogs").select("*").eq("project_uuid", id);
    if (result.error) {
      logger.error("Error in /project/:id route:", { error: result.error.message });
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json({ message: 'Project retrieved successfully', data: result.data });
  } catch (error: any) {
    logger.error("Error in /project/:id route:", { error: error.message });
    return res.status(500).json({ error: "Internal Server Error" });
  }
})

app.get("/projects", async (req, res) => {
  try {
    logger.info("Received request to /projects", { params: req.params });
    const result = await supabase.from("project").select("*");
    if (result.error) {
      logger.error("Error in /project route:", { error: result.error.message });
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json({ message: 'Project retrieved successfully', data: result.data });
  } catch(error: any) {
    logger.error("Error in /project route:", { error: error.message });
    return res.status(500).json({ error: "Internal Server Error" });
  }
})

app.post("/website", async (req, res) => {
  try {
    logger.info("Received request to /website", { requestBody: req.body });
    await createAddWebstePostHandler(req, res);
    logger.info("Successfully handled /website request");
  } catch (error: any) {
    logger.error("Error in /website route:", { error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/keys', async (req, res) => {
  try {
    logger.info("Received request to add API key", { requestBody: req.body });
    const validation = apiKeySchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn("Validation failed in /keys POST route", { errors: validation.error.errors });
      return res.status(400).json({ error: validation.error.errors[0].message });
    }
    const { key } = validation.data;
    await keyManager.addKey(key);
    logger.info("API key added successfully", { key });
    res.status(201).json({ message: 'API key added successfully' });
  } catch (error: any) {
    logger.error("Error in /keys POST route:", { error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete('/keys', async (req, res) => {
  try {
    logger.info("Received request to delete API key", { requestBody: req.body });
    const validation = apiKeySchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn("Validation failed in /keys DELETE route", { errors: validation.error.errors });
      return res.status(400).json({ error: validation.error.errors[0].message });
    }
    const { key } = validation.data;
    await keyManager.removeKey(key);
    logger.info("API key removed successfully", { key });
    res.status(200).json({ message: 'API key removed successfully' });
  } catch (error: any) {
    logger.error("Error in /keys DELETE route:", { error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(config.port, () => {
  logger.info(`Server started at http://${config.host}:${config.port}/`);
  console.log(`http://${config.host}:${config.port}/`);
});

export default app;
