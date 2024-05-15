'use strict'
import crypto from 'node:crypto';
import { BadRequestError } from "@/response/error.response";
import appConfig from "@/config/app.config";

const { encrypt: { algorithm, secret_key } } = appConfig;

class encryption {
    static encrypt = (payload) => {
        if (!payload) throw new BadRequestError('Invalid body');
        try {
            const iv = crypto.randomBytes(16); // Generate Initialization Vector
            const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret_key, 'hex'), iv);
            let encrypted = cipher.update(payload);
            encrypted = Buffer.concat([encrypted, cipher.final()])
            return encrypted.toString('hex') + iv.toString('hex');
        } catch (error) {
            throw new BadRequestError('Encryption failed, try again !')
        }
    }
    static decrypt = (text) => {
        if (!text && typeof text !== 'string') throw new BadRequestError('Invalid body');
        try {
            const iv = Buffer.from(text.slice(-32), 'hex');
            const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret_key, 'hex'), iv);
            const encryptedText = Buffer.from(text.slice(0, -32), 'hex');
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (err) {
            throw new BadRequestError("Bad token")
        }
    }
}

export default encryption;