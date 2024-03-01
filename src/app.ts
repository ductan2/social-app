import express from 'express'
import { SocialServer } from './server'
import { database } from './database'
class SocialApp {
   public initialize() {
      database.connect()
      const app = express()
      const server = new SocialServer(app)
      server.start();
   }
}
export const socialApp = new SocialApp()
socialApp.initialize()
