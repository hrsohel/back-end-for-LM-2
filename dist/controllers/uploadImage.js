"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = __importDefault(require("./firebase"));
const uploadImage = (image) => {
    return new Promise((resolve, reject) => {
        if (image) {
            try {
                const file = image;
                const randomNum = Math.floor(Math.random() * 10000);
                const date = new Date().toISOString().replace(/:/g, '-');
                const newFileName = `${randomNum}_${date}_${file.name}`;
                const blob = firebase_1.default.file(newFileName);
                const blobStream = blob.createWriteStream({ metadata: { contentType: file.mimetype } });
                blobStream.on('error', (err) => reject(err));
                blobStream.on('finish', async () => {
                    await blob.makePublic();
                    const publicUrl = `https://storage.googleapis.com/${firebase_1.default.name}/${blob.name}`;
                    resolve(publicUrl);
                });
                blobStream.end(file.data);
            }
            catch (error) {
                reject(error);
            }
        }
        else {
            resolve(null);
        }
    });
};
exports.default = uploadImage;
