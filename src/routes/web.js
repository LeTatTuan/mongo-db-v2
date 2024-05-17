'use strict'
import express from "express";
import { SuccessResponse } from "@/response/success.response";
import crypto from "node:crypto";
import asyncHandler from "@/middleware/asyncHandler";
import EncryptionController from "@/controller/EncryptionController";
import authController from "@/controller/auth.controller";
import authMiddleware from "@/middleware/authentication";
import productController from "@/controller/product.controller";

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
router.post('/auth/register', asyncHandler(authController.register));
router.post('/auth/login', asyncHandler(authController.login));
router.get('/auth/logout', authMiddleware.authenticateUser, asyncHandler(authController.logout));

//product routes
router.post('/products',
    [authMiddleware.authenticateUser, authMiddleware.authorizePermissions], asyncHandler(productController.createProduct));
router.get('/products', productController.getAllProducts);
router.get('/products/:id', asyncHandler(productController.getProduct));
router.put('/products/:id', [authMiddleware.authenticateUser, authMiddleware.authorizePermissions], asyncHandler(productController.updateProduct));
router.delete('/products/:id', [authMiddleware.authenticateUser, authMiddleware.authorizePermissions], asyncHandler(productController.deleteProduct));
export default router;