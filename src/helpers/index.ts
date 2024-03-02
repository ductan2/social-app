export class Helpers {
   static firstLetterUppercase(str: string) {
      return str.split(' ').map((c) => {
         return c.charAt(0).toUpperCase() + c.slice(1).toLocaleLowerCase();
      }).join(' ');
   }
   static lowerCase(str: string) {
      return str.toLocaleLowerCase();
   }
   static generateRandomInteget(length: number) {
      return Math.floor(Math.random() * Math.pow(10, length));
   }
   static parseJson(str: string) {
      try {
         return JSON.parse(str) ;
      } catch (error) {
         return str;
      }
   }
}