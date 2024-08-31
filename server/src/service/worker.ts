import redis from "../utils/redis";
import { Worker } from "bullmq";
import { queue } from "../utils/queue";
import createProjectBacklinks from "../lib/createProjectBacklink";
import createProjectBacklinksBlogs from "../lib/createProjectBacklinksBlogs";
import logger from "../utils/log";

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
            const res = await createProjectBacklinksBlogs(job.data);
            if(res instanceof Error) {
                logger.error("createProjectBacklinksBlogs ",res);
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