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
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailWorker = void 0;
const config_1 = require("../configs/config");
const email_transport_1 = require("../emails/email.transport");
const log = config_1.config.createLogger('EmailWorker');
class EmailWorker {
    addNotificationJob(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { html, to, subject, text } = job.data;
                yield email_transport_1.emailTransport.sendEmail({ html, to, subject, text });
                job.progress(100); // use this to update the progress of the job 
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error); // use this to send the error to the queue
            }
        });
    }
}
exports.emailWorker = new EmailWorker();
//# sourceMappingURL=email.worker.js.map