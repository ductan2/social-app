import { IFileImageJobData } from "@interfaces/image.interface";
import { BaseQueue } from "./base.queue";
import { imageWorker } from "@root/workers/image.worker";


class ImageQueue extends BaseQueue {
   constructor() {
      super('images');
      this.processJob('addImageToDB', 5, imageWorker.addImageToDB);

   }

   public addImageJob(name: string, data: IFileImageJobData): void {
      this.addJob(name, data);
   }
}

export const imageQueue: ImageQueue = new ImageQueue();