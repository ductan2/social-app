import { config } from '@config/config';
import { imageService } from '@services/image.service';
import { postService } from '@services/post.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';


const log: Logger = config.createLogger('ImageWorker');

class ImageWorker {
   async addUserProfileImageToDB(job: Job, done: DoneCallback): Promise<void> {
      try {
         const { key, value, imgId, imgVersion } = job.data;
         await imageService.addUserProfileImageToDb(key, value, imgId, imgVersion);
         job.progress(100);
         done(null, job.data);
      } catch (error) {
         log.error(error);
         done(error as Error);
      }
   }
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
   async updateBGImageInDB(job: Job, done: DoneCallback): Promise<void> {
      try {
        const { key, imgId, imgVersion } = job.data;
        await imageService.addBackgroundImageToDb(key, imgId, imgVersion);
        job.progress(100);
        done(null, job.data);
      } catch (error) {
        log.error(error);
        done(error as Error);
      }
    }
   async removeImageFromDB(job: Job, done: DoneCallback): Promise<void> {
      try {
        const { imageId } = job.data;
        await imageService.removeImage(imageId);
        job.progress(100);
        done(null, job.data);
      } catch (error) {
        log.error(error);
        done(error as Error);
      }
    }
}

export const imageWorker: ImageWorker = new ImageWorker();