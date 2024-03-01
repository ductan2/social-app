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
   constructor() {
      this.DATABASE_URL = process.env.DATABASE_URL || '';
      this.PORT = process.env.PORT || '';
      this.NODE_ENV = process.env.NODE_ENV || '';
      this.SECRET_KEY_1 = process.env.SECRET_KEY_1 || '';
      this.SECRET_KEY_2 = process.env.SECRET_KEY_2 || '';
      this.CLIENT_URL = process.env.CLIENT_URL || '';
      this.REDIS_HOST = process.env.REDIS_HOST || '';
   }
   public validateConfig() {
      for (const [key, value] of Object.entries(this)) {
         if (value === '' || value === undefined) {
            throw new Error(`Missing environment variable: ${key} or is empty. Please check your .env file.`);
         }
      }
   }
}

export const config: Config = new Config();