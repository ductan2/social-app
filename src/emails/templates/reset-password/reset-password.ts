import { IResetPasswordParams } from '@interfaces/user.interface';
import ejs from 'ejs';
import fs from 'fs';
class ResetPasswordTemplate {
   public passwordResetTemplate(templateParams: IResetPasswordParams) {
      const { date, email, ipaddress, username } = templateParams
      return ejs.render(fs.readFileSync(__dirname + '/reset-password.ejs', 'utf8'),
         {
            date,
            email,
            ipaddress,
            username,
            image_url: 'https://i.pinimg.com/474x/cc/99/bc/cc99bcd90c92f415f3591cd61a8b41f3.jpg'
         });
   }
}
export const resetPasswordTemplate = new ResetPasswordTemplate();