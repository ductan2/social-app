import { config } from '@config/config';
import { followerService } from '@services/follower.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';


const log: Logger = config.createLogger('followerWorker');

class FollowerWorker {
  async addFollowerToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { followerId, followingId, username, followerDocumentId } = job.data;
      await followerService.addFollowerToDB(followerId, followingId, username, followerDocumentId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeFollowerFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { followerId, followingId } = job.data;
      await followerService.removeFollowerToDB(followerId, followingId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const followerWorker: FollowerWorker = new FollowerWorker();
