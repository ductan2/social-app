"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordTemplate = void 0;
const ejs_1 = __importDefault(require("ejs"));
const fs_1 = __importDefault(require("fs"));
class ResetPasswordTemplate {
    passwordResetTemplate(templateParams) {
        const { date, email, ipaddress, username } = templateParams;
        return ejs_1.default.render(fs_1.default.readFileSync(__dirname + '/reset-password.ejs', 'utf8'), {
            date,
            email,
            ipaddress,
            username,
            image_url: 'https://i.pinimg.com/474x/cc/99/bc/cc99bcd90c92f415f3591cd61a8b41f3.jpg'
        });
    }
}
exports.resetPasswordTemplate = new ResetPasswordTemplate();
//# sourceMappingURL=reset-password.js.map