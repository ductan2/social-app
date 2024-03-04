import { Request, Response } from 'express';
import { authMockRequest, authMockResponse } from '../mock/auth.mock';
import { authController } from '@controllers/auth.controller';


const USERNAME = 'Manny';
const PASSWORD = 'manny1';

describe('SignOut', () => {
   it('should set session to null', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
      const res: Response = authMockResponse();
      await authController.logout(req, res);
      expect(req.session).toBeNull();
   });

   it('should send correct json response', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
      const res: Response = authMockResponse();
      await authController.logout(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
         message: '"User logged out successfully',
         user: {},
         token: ''
      });
   });
});