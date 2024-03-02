import { config } from "@config/config";
import { NotFoundError, UnauthorizedError } from "@interfaces/error.interface";
import { NextFunction, Request, Response } from "express";
import JWT from "jsonwebtoken"
export class AuthMiddleware {
   public verifyToken(req: Request, res: Response, next: NextFunction) {
      if (!req.session?.jwt) {
         throw new NotFoundError('Token not found, Please login again!');
      }
      try {
         const payload = JWT.verify(req.session.jwt, config.JWT_SECRET!) as any;
         req.currentUser = payload;
      } catch (error) {
         throw new UnauthorizedError('Token is invalid or expired, Please login again!');
      }
      next();
   }
   public checkAuthentication(req: Request, res: Response, next: NextFunction) {
      if(!req.currentUser) {
         throw new UnauthorizedError('Not Authorized');
      }
      next();
   }
}
export const authMiddleware = new AuthMiddleware();