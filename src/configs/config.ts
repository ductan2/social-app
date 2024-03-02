import cloudianry from 'cloudinary'
import bunyan from 'bunyan'
import dotenv from 'dotenv'

dotenv.config()
class Config {
   public readonly DATABASE_URL: string | undefined;
   public readonly PORT: string | undefined;
   public NODE_ENV: string | undefined
   public SECRET_KEY_1: string | undefined
   public SECRET_KEY_2: string | undefined
   public CLIENT_URL: string | undefined
   public REDIS_HOST: string | undefined
   public CLOUD_NAME: string | undefined
   public API_KEY: string | undefined
   public API_SECRET: string | undefined
   public JWT_SECRET: string | undefined
   public JWT_EXPIRATION: string | undefined
   constructor() {
      this.DATABASE_URL = process.env.DATABASE_URL || '';
      this.PORT = process.env.PORT || '';
      this.NODE_ENV = process.env.NODE_ENV || '';
      this.SECRET_KEY_1 = process.env.SECRET_KEY_1 || '';
      this.SECRET_KEY_2 = process.env.SECRET_KEY_2 || '';
      this.CLIENT_URL = process.env.CLIENT_URL || '';
      this.REDIS_HOST = process.env.REDIS_HOST || '';
      this.CLOUD_NAME = process.env.CLOUD_NAME || '';
      this.API_KEY = process.env.API_KEY || '';
      this.API_SECRET = process.env.API_SECRET || '';
      this.JWT_SECRET = process.env.JWT_SECRET || '';
      this.JWT_EXPIRATION = process.env.JWT_EXPIRATION || '';
   }
   public validateConfig() {
      for (const [key, value] of Object.entries(this)) {
         if (value === '' || value === undefined) {
            throw new Error(`Missing environment variable: ${key} or is empty. Please check your .env file.`);
         }
      }
   }
   public cloudinaryConfig() {
      cloudianry.v2.config({
         cloud_name: this.CLOUD_NAME,
         api_key: this.API_KEY,
         api_secret: this.API_SECRET
      })
   }
   public createLogger(name: string): bunyan {
      return bunyan.createLogger({ name, level: 'debug' });
   }
}

export const config: Config = new Config();