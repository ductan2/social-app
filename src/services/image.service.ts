
import { ImageModel } from '@models/image.model';
import { UserModel } from '@models/user.mode';
import mongoose from 'mongoose';

class ImageService {
  public async addUserProfileImageToDb(userId: string, url: string, imgId: string, imgVersion: string): Promise<void> {
    await UserModel.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, {
      profilePicture: url,
      imgId,
      imgVersion
    }).lean();
    await this.addImage(userId, imgId, imgVersion, 'profile');
  }
  public async addBackgroundImageToDb(userId: string, imgId: string, imgVersion: string): Promise<void> {

    await UserModel.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, {
      bgImageId: imgId,
      bgImageVersion: imgVersion
    }).lean();
    await this.addImage(userId, imgId, imgVersion, 'background');
  }

  public async addImage(userId: string, imgId: string, imgVersion: string, type: string): Promise<void> {
    await ImageModel.create({
      userId,
      bgImageVersion: type === 'background' ? imgVersion : '',
      bgImageId: type === 'background' ? imgId : '',
      imgVersion,
      imgId
    });
  }
  public async removeImage(imgId: string): Promise<void> {
    await ImageModel.deleteOne({ _id: imgId }).lean();
  }
  public async getBgImage(bgImageId: string) {
    return ImageModel.findOne({ bgImageId }).lean();
  }
  public async getImageByUserId(userId: string) {
    return ImageModel.findOne({
      userId
    }).lean();
  }
  public async getImageByBackgroundImageId(bgImageId: string) {
    return ImageModel.findOne({ bgImageId: bgImageId }).lean();
  }
}

export const imageService: ImageService = new ImageService();