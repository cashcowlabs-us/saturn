import redis from "../utils/redis";
import { Worker } from "bullmq";

new Worker("blog-generator", async (job) => {
    if(job.name) {
        console.log("I got a message" + job.id);
    }
}, {
    connection: redis,
    removeOnFail: {
        count: 3
    },
    concurrency: 10
})