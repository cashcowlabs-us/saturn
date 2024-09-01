import express from "express";
import config from "../utils/config";
import createProjectHandler from "../lib/handler/createProject";
import { z } from "zod";
import { keyManager } from "../lib/openapikeyManager";
import cors from "cors";
import logger from "../utils/log";
import supabase from "../utils/supabase";
import { queue } from "../utils/queue";

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
    logger.info("Received request to /project");
    await createProjectHandler(req, res);
    logger.info("Successfully handled /project request");
  } catch (error: any) {
    logger.error("Error in /project route:", { error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/project/blogs/:id", async (req, res) => {
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

app.get("/project/:id", async (req, res) => {
  try {
    logger.info("Received request to /project/:id", { params: req.params });
    const { id } = req.params;
    const result = await supabase.from("project").select("*").eq("id", id).single();
    if(result.data == null) {
      return res.status(404).json({ error: "Project not found" });
    }
    const backlink = await supabase.from("backlink").select("*").eq("project_uuid", result.data.id);
    if (backlink.data === null) {
      return res.status(404).json({ error: "Backlink not found" });
    }
    if (result.error !== null) {
      logger.error("Error in /project/:id route:", { error: "error" });
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json({ message: 'Project retrieved successfully', data: result.data, backlink: backlink.data });
  } catch (error: any) {
    logger.error("Error in /project/:id route:", { error: error.message });
    return res.status(500).json({ error: "Internal Server Error" });
  }
})

app.get("/project/regenerate/:id", async (req, res) => {
  try {
    logger.info("Received request to /project/regenerate/:id", { params: req.params });
    const { id } = req.params;
    const result = await supabase.from("project").select("*").eq("id", id).single();
    if (result.data == null) {
      return res.status(404).json({ error: "Project not found" });
    }
    const backlink = await supabase.from("backlink").select("*").eq("id", result.data.id).single();
    if (backlink.data === null) {
      return res.status(404).json({ error: "Backlink not found" });
    }
    for (let index = 0; index < backlink.data.dr_0_30; index++) {
      queue.add("createBacklink", { ...backlink.data });
    }
    for (let index = 0; index < backlink.data.dr_30_60; index++) {
      queue.add("createBacklink", { ...backlink.data });
    }
    for (let index = 0; index < backlink.data.dr_60_100; index++) {
      queue.add("createBacklink", { ...backlink.data });
    }
    if (result.error) {
      logger.error("Error in /project/:id route:", { error: `error ${result ?? ""}` });
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json({ message: 'Project regenerated successfully', data: result.data });
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
  } catch (error: any) {
    logger.error("Error in /project route:", { error: error.message });
    return res.status(500).json({ error: "Internal Server Error" });
  }
})

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

app.get("/keys", async (req, res) => {
  try {
    logger.info("Received request to get API keys");
    const keys = await supabase.from("api_keys").select("*");
    logger.info("API keys retrieved successfully");
    res.status(200).json({ message: 'API keys retrieved successfully', data: keys });
  } catch (error: any) {
    logger.error("Error in /keys GET route:", { error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
  }
})

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

app.post("/info/cal", async (req, res) => {
  try {
    logger.info("Received request to /info/cal", req.body.value);
    console.log(req.body);
    
    const value = await keyManager.calculateBlogs(parseInt(req.body.value));
    console.log(value);
    
    return res.status(200).json({ message: 'Token usage per day retrieved successfully', value });
  } catch (error: any) {
    logger.error("Error in /info/cal route:", { error: error.message });
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/info/calibrate", async (req, res) => {
  try {
    logger.info("Received request to /info/calibrate");
    await keyManager.refreshKeys();
    return res.status(200).json({ message: 'Calibration successful' });
  } catch {
    return res.status(500).json({ error: "Internal Server Error" });
  }
})


app.listen(config.port, () => {
  logger.info(`Server started at http://${config.host}:${config.port}/`);
  console.log(`http://${config.host}:${config.port}/`);
});

export default app;
