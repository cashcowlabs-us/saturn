/*
API Gateway:
   - Acts as a single entry point for all client-side requests.
   - Routes requests to appropriate microservices.
   - Handles load balancing, caching, and security (authentication/authorization).
   - Implemented using Express.js or a specialized API Gateway like Kong.
*/

import express from "express";
import config from "../utils/config";
import createProjectHandler from "../lib/handler/createProject";
import { createAddWebstePostHandler } from "../lib/handler/createAddWebsteHandler";

const app = express();
app.use(express.json());

app.post("/create-project", createProjectHandler);
app.post("/add-website", createAddWebstePostHandler);

app.listen(config.port, () => {
  console.log(`http://${config.host}:${config.port}/`);
})

export default app;