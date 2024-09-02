import redis from "../utils/redis";
import { Worker } from "bullmq";
import { queue } from "../utils/queue";
import createProjectBacklinks from "../lib/createProjectBacklink";
import createProjectBacklinksBlogs from "../lib/createProjectBacklinksBlogs";
import logger from "../utils/log";
import express from "express"
import { keyManager } from "../lib/openapikeyManager";

new Worker(queue.name, async (job) => {
    switch (job.name) {
        case "createBacklink": {
            const res = await createProjectBacklinks(job.data);
            if(res instanceof Error) {
                logger.error("createProjectBacklinks ",res);
            }
            break;
        }
        case "createBacklinkBlog": {
            let res : Error| null = null
            const skipTime = await keyManager.getNextAvailableTime()
            if(await  skipTime < new Date()) {
                res = await createProjectBacklinksBlogs(job.data);
            }
            if(res instanceof Error) {
                job.moveToDelayed(skipTime.getTime())
                logger.error(`createProjectBacklinksBlogs skipping till ${skipTime.toLocaleDateString()}`,res);
            }
            break;
        }
    }
}, {
    connection: redis,
    removeOnFail: {
        count: 3
    },
    concurrency: 10
})

const app  = express()
app.listen(8000, () => {})