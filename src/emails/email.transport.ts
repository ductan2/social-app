import nodemailer from 'nodemailer';
import SendGridMail from "@sendgrid/mail"
import Logger from 'bunyan';
import { config } from '../configs/config';
import { BadRequestError } from '@interfaces/error.interface';
import { IEmailOptions } from '@interfaces/user.interface';
SendGridMail.setApiKey(config.SENDGRID_API_KEY!);

const log: Logger = config.createLogger('EmailTransport');
class EmailTransport {
   public async sendEmail(options: IEmailOptions) {
      if (config.NODE_ENV === 'development') {
         await this.developmentEmailSender(options);
      }
      else {
         await this.productionEmailSender(options);
      }
   }
   private async productionEmailSender(options: IEmailOptions) {
      
   }
   private async developmentEmailSender(options: IEmailOptions) {
      const transporter = nodemailer.createTransport({
         host: "smtp.ethereal.email",
         port: 587,
         secure: false,
         auth: {
            user: config.SENDER_EMAIL,
            pass: config.SENDER_PASSWORD,
         },
      });
      try {
         const infoEmail = await transporter.sendMail({
            from: `Social app ${config.SENDER_EMAIL}`, // sender address
            to: options.to,// list of receivers
            subject: options.subject, // Subject line
            text: options.text, // plain text body
            html: options.html, // html body
         });
         log.info(`Message sent: ${infoEmail.messageId}`);
      } catch (error) {
         throw new BadRequestError('Error sending email');
      }
   }
}

export const emailTransport = new EmailTransport();