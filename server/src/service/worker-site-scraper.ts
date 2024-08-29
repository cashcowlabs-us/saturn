import redis from "../utils/redis";
import { Worker } from "bullmq";

new Worker("site-scraper", async (job) => {
    console.log("I got a message" + job.id);
}, {
    connection: redis,
    removeOnFail: {
        count: 3
    },
    concurrency: 50
})