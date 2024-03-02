import express from 'express'
import { SocialServer } from './server'
import { database } from './database'
import { config } from './configs/config'
class SocialApp {
   public initialize() {
      config.cloudinaryConfig()
      database.connect()
      const app = express()
      const server = new SocialServer(app)
      server.start();
   }
}
export const socialApp = new SocialApp()
socialApp.initialize()
