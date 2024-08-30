import redis from "../utils/redis";
import { Worker } from "bullmq";
import { queue } from "../utils/queue";
import createProjectBacklinks from "../lib/createProjectBacklink";
import createProjectBacklinksBlogs from "../lib/createProjectBacklinksBlogs";

new Worker(queue.name, async (job) => {
    switch (job.name) {
        case "createBacklink": {
            const res = await createProjectBacklinks(job.data);
            console.log("createProjectBacklinks ",res);
            break;
        }
        case "createBacklinkBlog": {
            const res = await createProjectBacklinksBlogs(job.data);
            console.log("createProjectBacklinksBlogs ",res);
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