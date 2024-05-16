import { CREATED, SuccessResponse } from "@/response/success.response.js";
import authService from "../services/auth.service.js";

const authController = {
    register: async (req, res) => {
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;
        const userDto = { ...req.body, userAgent, ip };

        new CREATED({
            message: 'register success',
            metadata: await authService.register(userDto)
        }).send(res);
    },

    login: async (req, res) => {
        const { valueLogin, password } = req.body;
        const reqInfor = {
            ip: req.ip,
            userAgent: req.headers['user-agent']
        }
        new SuccessResponse({
            message: 'login success',
            metadata: await authService.login(valueLogin, password, reqInfor, res)
        }).send(res);
    },

    logout: async (req, res) => {
        new SuccessResponse({
            message: 'User logged out',
            metadata: await authService.logout(req, res)
        }).send(res);
    }

}
export default authController;