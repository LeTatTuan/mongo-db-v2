import jwtService from "@/services/jwt.service";
import config from '@/config/app.config.js';
import Token from "@/models/Token";
import { Unauthorized } from "@/response/error.response";

const ACCESS_TOKEN_SECRET = config.app.secret_access;
const REFRESH_TOKEN_SECRET = config.app.secret_refresh;
const authenticateUser = async (req, res, next) => {
    const { refreshToken, accessToken } = req.signedCookies;
    console.log(accessToken, refreshToken);

    try {
        if (accessToken) {
            const payload = jwtService.isTokenValid(accessToken, ACCESS_TOKEN_SECRET);
            console.log(payload);
            return next();
        }
        const payload = jwtService.isTokenValid(refreshToken, REFRESH_TOKEN_SECRET);

        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken,
        });

        if (!existingToken || !existingToken?.isValid) {
            throw new Unauthorized('Authentication Invalid');
        }

        jwtService.attachCookiestoResponse({ res, user: payload.user });

        req.user = payload.user;
        next();
    } catch (error) {
        throw new Unauthorized('Authentication Invalid');
    }
};

const authorizePermissions = (req, res, next) => {
    console.log(req.user.roles);
    const roles = req.user.roles.map(role => role.name);
    return;
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new Unauthorized('Unauthorized to access this route');
        }
        next();
    };
};

const authMiddleware = {
    authenticateUser, authorizePermissions
}

export default authMiddleware;
