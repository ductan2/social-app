import { config } from './configs/config';
import mongoose, { ConnectOptions } from 'mongoose';
import { redisConnection } from './redis/redis.connection';
import Logger from 'bunyan';
const logger : Logger = config.createLogger('Database');

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
         redisConnection.connection();
         logger.info("Connected to the database successfully");
      } catch (error) {
         logger.error("Error connecting to the database:", error);
         process.exit(1);
      }
      }
}
export const database = new Database();
