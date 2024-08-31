import express from "express";
import config from "../utils/config";
import createProjectHandler from "../lib/handler/createProject";
import { createAddWebstePostHandler } from "../lib/handler/createAddWebsteHandler";
import { z } from "zod";
import { keyManager } from "../lib/openapikeyManager";

const app = express();
app.use(express.json());

const apiKeySchema = z.object({
  key: z.string().min(1, { message: 'API key is required' }),
});

app.post("/project", async (req, res) => {
  try {
    await createProjectHandler(req, res);
  } catch (error) {
    console.error("Error in /project route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/website", async (req, res) => {
  try {
    await createAddWebstePostHandler(req, res);
  } catch (error) {
    console.error("Error in /website route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/keys', async (req, res) => {
  try {
    const validation = apiKeySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }
    const { key } = validation.data;
    
    await keyManager.addKey(key);
    res.status(201).json({ message: 'API key added successfully' });
  } catch (error) {
    console.error("Error in /keys POST route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete('/keys', async (req, res) => {
  try {
    const validation = apiKeySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }
    const { key } = validation.data;
    await keyManager.removeKey(key);
    res.status(200).json({ message: 'API key removed successfully' });
  } catch (error) {
    console.error("Error in /keys DELETE route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(config.port, () => {
  console.log(`http://${config.host}:${config.port}/`);
});

export default app;
