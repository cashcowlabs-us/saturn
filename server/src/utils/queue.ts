import { Queue } from "bullmq";
import redis from "./redis";

export const siteScrapQueue = new Queue("site-scraper", { 
    connection: redis,
})

export const blogQueue = new Queue("blog", {
    connection: redis
})