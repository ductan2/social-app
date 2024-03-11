
import { imageController } from "@controllers/image.controller";
import { Router } from "express";

class ImageRouter {
   public router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {

      this.router.post('/profile', imageController.addProfileImage);
      this.router.post('/background', imageController.addBackgroundImage);
      this.router.get('/:imageId', imageController.getImage);
      this.router.delete('/:imageId', imageController.deleteImage);
      this.router.delete('/background/:bgImageId', imageController.deleteBackgroundImage);
      return this.router;
   }

}
export const imageRouter = new ImageRouter();