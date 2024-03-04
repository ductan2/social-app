
import { ImageModel } from '@models/image.model';
import mongoose from 'mongoose';

class ImageService {


  public async addImage(userId: string, imgId: string, imgVersion: string, type: string): Promise<void> {
    await ImageModel.create({
      userId,
      bgImageVersion: type === 'background' ? imgVersion : '',
      bgImageId: type === 'background' ? imgId : '',
      imgVersion,
      imgId
    });
  }
}

export const imageService: ImageService = new ImageService();