import { BadRequestError } from "../interfaces/error.interface";
import { ObjectSchema } from "joi";


export const JoiValidation = (schema: ObjectSchema)=> {
   return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
         const req: Request = args[0];
         const { error } = await Promise.resolve(schema.validate(req.body));
         if (error?.details) {
            throw new BadRequestError(error.details[0].message);
         }
         return originalMethod.apply(this, args);
      };
      return descriptor;
   }
}