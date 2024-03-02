import Queue, { Job } from "bull";
import { BullAdapter, ExpressAdapter, createBullBoard } from "@bull-board/express"
import Logger from "bunyan";
import { config } from "@config/config";
let bullAdapters: BullAdapter[] = []

export let serverAdapter: ExpressAdapter;
export abstract class BaseQueue {
   queue: Queue.Queue
   log: Logger;
   constructor(queueName: string) {
      this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
      bullAdapters.push(new BullAdapter(this.queue));
      bullAdapters = [...new Set(bullAdapters)];
      serverAdapter = new ExpressAdapter();
      serverAdapter.setBasePath('/queues');

      createBullBoard({
         queues: bullAdapters,
         serverAdapter: serverAdapter
      });
      this.log = config.createLogger(`${queueName}Queue`)
      this.queue.on('completed', (job: Job) => {
         job.remove();
      })
      this.queue.on('global:completed', (jobId: string) => {
         this.log.info(`Job ${jobId} has been completed`)
      })
      this.queue.on('global:stalled', (jobId: string) => {
         this.log.error(`Job ${jobId} has been stalled`)
      })
   }
   protected addJob(name: string, data: any) {
      this.queue.add(name, data, {
         attempts: 3, backoff: { type: 'fixed', delay: 5000 }
         // retry 3 times with 5 seconds delay if failed
      })
   }
   protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>){
      this.queue.process(name, concurrency, callback)
   }
}