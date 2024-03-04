"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploads = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
function uploads(file, public_id, overwrite, invalidate) {
    return new Promise((resolve) => {
        cloudinary_1.default.v2.uploader.upload(file, {
            public_id,
            overwrite,
            invalidate,
            resource_type: 'auto' // zip, images
        }, (error, result) => {
            if (error)
                resolve(error);
            resolve(result);
        });
    });
}
exports.uploads = uploads;
//# sourceMappingURL=cloudinary.js.map