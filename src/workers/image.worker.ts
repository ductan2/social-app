import { config } from '@config/config';
import { imageService } from '@services/image.service';
import { postService } from '@services/post.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';


const log: Logger = config.createLogger('ImageWorker');

class ImageWorker {
   async addImageToDB(job: Job, done: DoneCallback): Promise<void> {
      try {
         const { key, imgId, imgVersion } = job.data;
         await imageService.addImage(key, imgId, imgVersion, '');
         job.progress(100);
         done(null, job.data);
      } catch (error) {
         log.error(error);
         done(error as Error);
      }
   }
}

export const imageWorker: ImageWorker = new ImageWorker();