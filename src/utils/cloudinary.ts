import cloudinary, { type UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export function uploads(
   file: string,
   public_id?: string,
   overwrite?: boolean,
   invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
   return new Promise((resolve) => {
      cloudinary.v2.uploader.upload(
         file,
         {
            public_id,
            overwrite,
            invalidate,
            resource_type: 'auto' // zip, images
         },
         (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) resolve(error);
            resolve(result);
         }
      );
   });
}
export function uploadVideo(file: string,
   public_id?: string,
   overwrite?: boolean,
   invalidate?: boolean): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
   return new Promise((resolve) => {
      cloudinary.v2.uploader.upload(
         file,
         {
            public_id,
            overwrite,
            invalidate,
            resource_type: 'video',
            chunk_size: 5 * 1000 * 1000,  //5MB
         },
         (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) resolve(error);
            resolve(result);
         }
      );
   });
}
