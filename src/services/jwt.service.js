import jwt from 'jsonwebtoken';
import config from '@/config/app.config.js';

const ACCESS_TOKEN_SECRET = config.app.secret_access;
const REFRESH_TOKEN_SECRET = config.app.secret_refresh;

const createJWT = ({ payload }, key) => {
    const token = jwt.sign(payload, key, {
        expiresIn: 86400,
    });
    return token;
}

const isTokenValid = (token, key) => jwt.verify(token, key);

const attachCookiestoResponse = ({ res, user }) => {
    const accessTokenJWT = createJWT({ payload: { user } }, ACCESS_TOKEN_SECRET);
    const refreshTokenJWT = createJWT({ payload: { user } }, REFRESH_TOKEN_SECRET);

    const oneDay = 1000 * 60 * 60 * 24;
    const longerExp = 1000 * 60 * 60 * 24 * 30;

    res.cookie('accessToken', accessTokenJWT, {
        httpOnly: true,
        secure: true,
        signed: true,
        expires: new Date(Date.now() + oneDay),
    });

    res.cookie('refreshToken', refreshTokenJWT, {
        httpOnly: true,
        secure: true,
        signed: true,
        expires: new Date(Date.now() + longerExp),
    });
}

const jwtService = {
    createJWT, isTokenValid, attachCookiestoResponse
}

export default jwtService;