import crypto from 'crypto';
export class Helpers {
   static firstLetterUppercase(str: string) {
      // use this method for username
      return str.split(' ').map((c) => {
         return c.charAt(0).toUpperCase() + c.slice(1).toLocaleLowerCase();
      }).join(' ');
   }
   static lowerCase(str: string) {
      // use this method for email
      return str.toLocaleLowerCase();
   }
   static generateRandomInteget(length: number) {
      return Math.floor(Math.random() * Math.pow(10, length));
   }
   static async generateRandomString() {
      const randomBytes = await Promise.resolve(crypto.randomBytes(20))
      return randomBytes.toString('hex');
   }
   static parseJson(str: string) {
      try {
          JSON.parse(str);
      } catch (error) {
         return str;
      }
      return JSON.parse(str);
   }
}