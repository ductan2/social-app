import { Application, NextFunction, Request, Response, json } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookierSession from "cookie-session"
import HTTP_STATUS from 'http-status-codes';
import compression from 'compression'
import logger from './configs/logger';
import { config } from './configs/config';
import { Server } from 'socket.io'

import 'express-async-errors'
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { routerMain } from './routes/index.routes';
import { ErrorCustom, IErrorResponse } from './types/error.type';
import { isNamedExportBindings } from 'typescript';


export class SocialServer {
   private socialApp: Application
   private PORT = config.PORT || 3000
   constructor(app: Application) {
      this.socialApp = app
   }
   public start() {
      this.securityMiddleware(this.socialApp)
      this.standardMiddleware(this.socialApp)
      this.routeMiddleware(this.socialApp)
      this.globalErrorHandler(this.socialApp)
      this.startServer(this.socialApp)
   }
   private securityMiddleware(app: Application) {
      app.use(
         cookierSession({
            name: 'session', // name of the cookie
            keys: [`${config.SECRET_KEY_1}`, `${config.SECRET_KEY_2}`], // keys for the cookie
            maxAge: 24 * 60 * 60 * 1000,// 24 hours 
            secure: false, // set to true if your using https
         })
      )
      app.use(cors()) // enable cors
      app.use(hpp()) // prevent http parameter pollution
      app.use(helmet())// set security headers
      app.use(cors({
         origin: '*', // * for all
         credentials: true, // enable credentials
         optionsSuccessStatus: HTTP_STATUS.OK // 200 for preflight
      }))


   }
   private standardMiddleware(app: Application) {
      app.use(compression())
      app.use(json({ limit: '50mb' }))
   }
   private routeMiddleware(app: Application) {
      app.use(routerMain.routes())
   }
   private globalErrorHandler(app: Application) {
      app.all('*', (req: Request, res: Response) => {
         res.status(HTTP_STATUS.NOT_FOUND).json({
            message: `Can't find ${req.originalUrl} on this server!`
         })
      })
      app.use((err: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
         console.log("🚀 ~ SocialServer ~ app.use ~ err:", err)
         if (err instanceof ErrorCustom) {
            res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(err.serializedErrors())
         }
         next();
      })
   }
   private createSockerIO(httpServer: http.Server) {
      const io: Server = new Server(httpServer, {
         cors: {
            origin: config.CLIENT_URL,
            methods: ["GET", "POST", 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
         },
      })
      const pubClient = createClient({ url: `${config.REDIS_HOST}` });
      const subClient = pubClient.duplicate();
      Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      });
      io.adapter(createAdapter(pubClient, subClient));
      return io;
   }
   private sockerIOConnection(io: Server) {

   }
   private startHttpServer(httpServer: http.Server) {
      logger.info(`Server is running on port ${this.PORT} with process ${process.pid}`)
      httpServer.listen(this.PORT, () => {
         logger.info(`Server is running on port ${this.PORT}`)
      })
   }
   private startServer(app: Application) {
      const httpServer = new http.Server(app)
      const sockerIO = this.createSockerIO(httpServer)
      this.startHttpServer(httpServer)
      this.sockerIOConnection(sockerIO)
   }
}
