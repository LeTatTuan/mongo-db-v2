'use strict'

import { SuccessResponse } from "@/response/success.response"
import encryption from "@/services/encryption.service"
import { formatDate } from "@/utils/function";

const EncryptionController = {
    encrypt: (req, res) => {
        let { payload } = req.body;
        payload += `-${formatDate(new Date())}`;
        new SuccessResponse({
            message: 'encrypt data success',
            metadata: encryption.encrypt(payload)
        }).send(res);
    },
    decrypt: (req, res) => {
        const { payload } = req.body;
        new SuccessResponse({
            message: 'decrypt data success',
            metadata: encryption.decrypt(payload)
        }).send(res);
    },
}

export default EncryptionController;