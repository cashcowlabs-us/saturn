import { configDotenv } from "dotenv";

configDotenv()
const config = {
  port: process.env["PORT"] ?? "4000",
  host: process.env["HOST"] ?? "localhost",
  supabaseUrl: process.env["SUPABASE_URL"] ?? "",
  supabaseKey: process.env["SUPABASE_KEY"] ?? "",
  redisUrl: process.env["REDIS_URL"] ?? "",
  redisPassword: process.env["REDIS_KEY"] ?? "",
  redisPort: process.env["REDIS_PORT"] ?? "",
  matchSiteURL: process.env["MATCH_SITE_SERVICE_URL"] ?? "",
  scrapeSiteURL: process.env["SCRAPE_SITE_SERVICE_URL"] ?? "",
  generateContentURL: process.env["GENERATE_CONTENT_SERVICE_URL"] ?? "",
  openaiKey: process.env["OPENAI_KEY"] ?? ""
}

export default config