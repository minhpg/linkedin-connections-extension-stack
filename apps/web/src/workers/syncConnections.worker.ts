// src/workers/sample.worker.ts
import { Worker, Queue } from "bullmq";
import { connection } from "./redisConnection";
import { Queues } from "./queues";
import { z } from "zod";
import { userConnectionValidation, userProfileValidation } from "@/server/api/routers/connection";

export const syncConnectionQueueDataValidation = z.object({
    users: z.array(userProfileValidation),
    connections: z.array(userConnectionValidation)
})

export const sampleQueue = new Queue(Queues.SyncConnections, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

const worker = new Worker(
  Queues.SyncConnections, // this is the queue name, the first string parameter we provided for Queue()
  async (job) => {
    const data = job?.data;
    const {
        users,
        connections
    } = syncConnectionQueueDataValidation.parse(data);

    

  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
);

export default worker;
