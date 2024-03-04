import ejs from 'ejs';
import fs from 'fs';
class ForgotPasswordTemplate {
   public forgotPasswordTemplate(username: string, resetLink: string) {
      return ejs.render(fs.readFileSync(__dirname + '/forgot-password.ejs', 'utf8'),
         {
            username,
            resetLink,
            image_url: 'https://i.pinimg.com/474x/cc/99/bc/cc99bcd90c92f415f3591cd61a8b41f3.jpg'
         });
   }
}
export const forgotPasswordTemplate = new ForgotPasswordTemplate();