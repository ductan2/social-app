import mongoose, { ConnectOptions } from 'mongoose';
import { config } from './configs/config';
import logger from './configs/logger';

class Database {
   async connect() {
      mongoose.connection.on('error', (err) => {
         logger.error("Error database is ==> ", err);
         process.exit(1);
      }); if (process.env.NODE_ENV !== "production") {
         mongoose.set('debug', true);
      }
      try {
         await mongoose.connect(`${config.DATABASE_URL}`, {
            useNewUrlParser: true, // 
            useUnifiedTopology: true,
         } as ConnectOptions);
         logger.info("Connected to the database successfully");
      } catch (error) {
         logger.error("Error connecting to the database:", error);
         process.exit(1);
      }
      }
}
export const database = new Database();
