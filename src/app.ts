import express from 'express'
import { SocialServer } from './server'
import { database } from './database'
import { config } from './configs/config'
import Logger from 'bunyan'
const log: Logger = config.createLogger('SocialApp');
class SocialApp {
   public initialize() {
      config.cloudinaryConfig()
      database.connect()
      config.validateConfig()
      const app = express()
      const server = new SocialServer(app)
      server.start();
      SocialApp.handleExit();
   }
   
   private static handleExit(): void {
      process.on('uncaughtException', (error: Error) => {
         log.error(`There was an uncaught error: ${error}`);
         SocialApp.shutDownProperly(1);
      });

      process.on('unhandleRejection', (reason: Error) => {
         log.error(`Unhandled rejection at promise: ${reason}`);
         SocialApp.shutDownProperly(2);
      });

      process.on('SIGTERM', () => {
         log.error('Caught SIGTERM');
         SocialApp.shutDownProperly(2);
      });

      process.on('SIGINT', () => {
         log.error('Caught SIGINT');
         SocialApp.shutDownProperly(2);
      });

      process.on('exit', () => {
         log.error('Exiting');
      });
   }

   private static shutDownProperly(exitCode: number): void {
      Promise.resolve()
         .then(() => {
            log.info('Shutdown complete');
            process.exit(exitCode);
         })
         .catch((error) => {
            log.error(`Error during shutdown: ${error}`);
            process.exit(1);
         });
   }
}
export const socialApp = new SocialApp()
socialApp.initialize()
