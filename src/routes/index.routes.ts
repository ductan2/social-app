import { Router } from "express";
import { authRouter } from "./auth.routes";
import { serverAdapter } from "@root/queues/base.queue";

const BASE_URL = '/api/v1'
class RouterMain {
   private router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.use('/queues',serverAdapter.getRouter())
      this.router.use(`${BASE_URL}/auth`, authRouter.routes())
      return this.router;
   }
}
export const routerMain = new RouterMain();