import redis from "../utils/redis";
import { Worker } from "bullmq";

new Worker("blog-generator", async (job) => {
    console.log("I got a message" + job.id);
}, {
    connection: redis,
    removeOnFail: {
        count: 3
    },
    concurrency: 50
})