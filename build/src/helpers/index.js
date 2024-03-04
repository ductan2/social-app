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
exports.Helpers = void 0;
const crypto_1 = __importDefault(require("crypto"));
class Helpers {
    static firstLetterUppercase(str) {
        return str.split(' ').map((c) => {
            return c.charAt(0).toUpperCase() + c.slice(1).toLocaleLowerCase();
        }).join(' ');
    }
    static lowerCase(str) {
        return str.toLocaleLowerCase();
    }
    static generateRandomInteget(length) {
        return Math.floor(Math.random() * Math.pow(10, length));
    }
    static generateRandomString() {
        return __awaiter(this, void 0, void 0, function* () {
            const randomBytes = yield Promise.resolve(crypto_1.default.randomBytes(20));
            return randomBytes.toString('hex');
        });
    }
    static parseJson(str) {
        try {
            return JSON.parse(str);
        }
        catch (error) {
            return str;
        }
    }
}
exports.Helpers = Helpers;
//# sourceMappingURL=index.js.map