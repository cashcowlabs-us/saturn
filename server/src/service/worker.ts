import redis from "../utils/redis";
import { Worker } from "bullmq";
import { queue } from "../utils/queue";
import createProjectBacklinks from "../lib/createProjectBacklink";
import createProjectBacklinksBlogs from "../lib/createProjectBacklinksBlogs";
import logger from "../utils/log";
import express from "express";
import { keyManager } from "../lib/openapikeyManager";

new Worker(queue.name, async (job) => {
    logger.info(`Processing job ${job.id} of type ${job.name}`);
    
    try {
        switch (job.name) {
            case "createBacklink": {
                logger.info(`Job ${job.id}: Starting createBacklink`);
                const res = await createProjectBacklinks(job.data);
                if (res instanceof Error) {
                    logger.error(`Job ${job.id}: Error in createProjectBacklinks`, res);
                } else {
                    logger.info(`Job ${job.id}: Successfully completed createBacklink`);
                }
                break;
            }
            case "createBacklinkBlog": {
                logger.info(`Job ${job.id}: Starting createBacklinkBlog`);
                const skipTime = await keyManager.getNextAvailableTime();
                logger.info(`Job ${job.id}: Next available time is ${skipTime.toLocaleDateString()}`);

                if (skipTime.getTime() < Date.now()) {
                    const res = await createProjectBacklinksBlogs(job.data);
                    if (res instanceof Error) {
                        logger.error(`Job ${job.id}: Error in createProjectBacklinksBlogs`, res);
                    } else {
                        logger.info(`Job ${job.id}: Successfully completed createBacklinkBlog`);
                    }
                } else {
                    logger.info(`Job ${job.id}: Skipping execution, waiting until ${skipTime.toLocaleDateString()}`);
                    job.moveToDelayed(skipTime.getTime());
                }
                break;
            }
            default: {
                logger.warn(`Job ${job.id}: Unknown job type ${job.name}`);
            }
        }
    } catch (err) {
        logger.error(`Job ${job.id}: Unexpected error`, err);
    }
}, {
    connection: redis,
    removeOnFail: {
        count: 3
    },
    concurrency: 10
});

const app = express();
app.listen(8000, () => {
    logger.info("Server is running on port 8000");
});
