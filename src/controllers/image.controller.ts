import { config } from "@config/config";
import { BadRequestError } from "@interfaces/error.interface";
import { IUserDocument } from "@interfaces/user.interface";
import { JoiValidation } from "@root/decorators/joi-validation.decorator";
import { Helpers } from "@root/helpers";
import { imageQueue } from "@root/queues/image.queue";
import { userCache } from "@root/redis/user.cache";
import { addImageSchema } from "@root/schemas/image.schema";
import { socketIOImageObject } from "@root/sockets/image";
import { imageService } from "@services/image.service";
import { uploads } from "@utils/cloudinary";
import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";


class ImageController {
   @JoiValidation(addImageSchema)
   public async addProfileImage(req: Request, res: Response) {
      const { image } = req.body;
      const result = await uploads(image, req.currentUser!.userId, true, true)
      if (!result?.public_id) {
         throw new BadRequestError('Error uploading image');
      }
      const cacheUser = await userCache.updateSingleUserItemInCache(req.currentUser!.userId, 'profilePicture', result.secure_url)
      socketIOImageObject.emit('update user', cacheUser);
      imageQueue.addImageJob('addImageJob', { userId: req.currentUser!.userId, value: result.secure_url, imageId: result.public_id, imgVersion: result.version.toString() })
      res.status(HTTP_STATUS.OK).json({ message: 'Image uploaded successfully', imageUrl: result.secure_url });
   }
   @JoiValidation(addImageSchema)
   public async addBackgroundImage(req: Request, res: Response) {
      const { version, publicId } = await ImageController.prototype.backgroundUpload(req.body.image)
      const bgImageId = userCache.updateSingleUserItemInCache(req.currentUser!.userId, 'bgImageId', publicId)
      const bgImageVersion = userCache.updateSingleUserItemInCache(req.currentUser!.userId, 'bgImageVersion', version)
      const response: [IUserDocument, IUserDocument] = await Promise.all([bgImageId, bgImageVersion])
      socketIOImageObject.emit('update user', {
         bgImageId: publicId,
         bgImageVersion: version,
         user: response[0]
      })
      imageQueue.addImageJob('updateBGImageInDB', {
         key: req.currentUser!.userId,
         imgId: publicId,
         imgVersion: version.toString(),
      })
      res.status(HTTP_STATUS.OK).json({
         message: 'Image uploaded successfully',
         imageUrl: `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${version}/${publicId}`
      });
   }
   private async backgroundUpload(image: string) {
      const isDataUrl = Helpers.isDataURL(image);
      let version = '';
      let publicId = '';
      if (isDataUrl) {
         const result = await uploads(image)
         if (!result?.public_id) {
            throw new BadRequestError('Error uploading image');
         }
         version = result.version.toString()
         publicId = result.public_id
      }
      else {
         const value = image.split('/');
         version = value[value.length - 2];
         publicId = value[value.length - 1].split('.')[0];
      }
      return { version: version.replace(/v/g, ''), publicId }
   }
   public async getImage(req: Request, res: Response) {
      const image = await imageService.getImageByUserId(req.params.userId)
      res.status(HTTP_STATUS.OK).json({message:"Get user image", image });
   }

   public async deleteImage(req: Request, res: Response) {
      const { imageId } = req.params;
      socketIOImageObject.emit('delete image', imageId);
      imageQueue.addImageJob('removeImageFromDB', { imageId })
      res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
   }
   public async deleteBackgroundImage(req: Request, res: Response) {
      const image = await imageService.getImageByBackgroundImageId(req.params.bgImageId)
      socketIOImageObject.emit('delete image', image?._id);
      await userCache.updateSingleUserItemInCache(req.currentUser!.userId, 'bgImageId', '')
      await userCache.updateSingleUserItemInCache(req.currentUser!.userId, 'bgImageVersion', '')
      imageQueue.addImageJob('removeImageFromDB', { imageId: image?._id })
      res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
   }
}
export const imageController = new ImageController();