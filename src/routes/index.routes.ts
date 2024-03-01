import { Router } from "express";
const BASE_URL = '/api/v1'
class RouterMain {
   private router: Router;
   constructor() {
      this.router = Router();
   }
   public routes() {
      this.router.use(`${BASE_URL}/`)
      return this.router;
   }
}
export const routerMain = new RouterMain();