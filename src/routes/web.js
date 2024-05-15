'use strict'
import express from "express";
import { SuccessResponse } from "@/response/success.response";
import crypto from "node:crypto";
import asyncHandler from "@/middleware/asyncHandler";
import EncryptionController from "@/controller/EncryptionController";

const router = express.Router();

router.post('/', (req, res) => {
    new SuccessResponse({
        message: 'request success',
        metadata: {
            body: "hello world"
        }
    }).send(res);
})

router.post('/test', (req, res) => {
    try {
        const { length } = req.body;
        const key = crypto.randomBytes(length).toString('hex');
        return res.status(200).json(key)
    } catch (err) {
        throw new Error(err)
    }
})
router.post('/encrypt', asyncHandler(EncryptionController.encrypt));
router.post('/decrypt', asyncHandler(EncryptionController.decrypt));

// auth routes
router.post('/auth/register')
router.get('/auth/login');

export default router;