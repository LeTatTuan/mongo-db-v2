import jwtService from "@/services/jwt.service";
import config from '@/config/app.config.js';
import Token from "@/models/Token";
import { Unauthorized } from "@/response/error.response";
import { ROLES } from "@/enum";

const ACCESS_TOKEN_SECRET = config.app.secret_access;
const REFRESH_TOKEN_SECRET = config.app.secret_refresh;
const authenticateUser = async (req, res, next) => {
    const { refreshToken, accessToken } = req.signedCookies;

    try {
        if (accessToken) {
            const payload = jwtService.isTokenValid(accessToken, ACCESS_TOKEN_SECRET);
            req.user = payload.user;
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
    const roles = req.user.roles;
    roles.some(role => {
        if (!ROLES.includes(role.name))
            throw new Unauthorized('Unauthorized to access this route');
    })
    next();
};

const authMiddleware = {
    authenticateUser, authorizePermissions
}

export default authMiddleware;
