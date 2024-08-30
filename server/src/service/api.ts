/*
API Gateway:
   - Acts as a single entry point for all client-side requests.
   - Routes requests to appropriate microservices.
   - Handles load balancing, caching, and security (authentication/authorization).
   - Implemented using Express.js or a specialized API Gateway like Kong.
*/

import express from "express";
import config from "../utils/config";
import matchSite from "../lib/matchSite";
import createProjectHandler from "../lib/handler/createProject";
import createProjectBacklinksHandler from "../lib/handler/createProjectBacklink";

const app = express();
app.use(express.json());

app.post("/create-project", createProjectHandler);

app.post("/create-project-backlink", createProjectBacklinksHandler);

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

