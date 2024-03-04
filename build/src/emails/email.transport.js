"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTransport = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const config_1 = require("../configs/config");
const error_interface_1 = require("../interfaces/error.interface");
mail_1.default.setApiKey(config_1.config.SENDGRID_API_KEY);
const log = config_1.config.createLogger('EmailTransport');
class EmailTransport {
    sendEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(config_1.config.NODE_ENV);
            if (config_1.config.NODE_ENV === 'development') {
                yield this.developmentEmailSender(options);
            }
            else {
                yield this.productionEmailSender(options);
            }
        });
    }
    productionEmailSender(options) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    developmentEmailSender(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = nodemailer_1.default.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: config_1.config.SENDER_EMAIL,
                    pass: config_1.config.SENDER_PASSWORD,
                },
            });
            try {
                const infoEmail = yield transporter.sendMail({
                    from: `Social app ${config_1.config.SENDER_EMAIL}`,
                    to: options.to,
                    subject: options.subject,
                    text: options.text,
                    html: options.html, // html body
                });
                log.info(`Message sent: ${infoEmail.messageId}`);
            }
            catch (error) {
                log.error("🚀 ~ EmailTransport ~ developmentEmailSender ~ error:", error);
                throw new error_interface_1.BadRequestError('Error sending email');
            }
        });
    }
}
exports.emailTransport = new EmailTransport();
//# sourceMappingURL=email.transport.js.map