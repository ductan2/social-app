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
   static isDataURL(value: string): boolean {
      const dataUrlRegex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
      return dataUrlRegex.test(value);
   }
   static shuffle(array: string[]) {
      // ? shuffle the array
      for (let i = array.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
   }
   static escapeRegex(text: string) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
   }
}