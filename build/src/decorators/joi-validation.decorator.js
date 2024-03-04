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
exports.JoiValidation = void 0;
const error_interface_1 = require("../interfaces/error.interface");
const JoiValidation = (schema) => {
    return (_target, _key, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                const req = args[0];
                const { error } = yield Promise.resolve(schema.validate(req.body));
                if (error === null || error === void 0 ? void 0 : error.details) {
                    throw new error_interface_1.BadRequestError(error.details[0].message);
                }
                return originalMethod.apply(this, args);
            });
        };
        return descriptor;
    };
};
exports.JoiValidation = JoiValidation;
//# sourceMappingURL=joi-validation.decorator.js.map