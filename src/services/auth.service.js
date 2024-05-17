import jwt from "jsonwebtoken";
import User from "@/models/User.js";
import Role from "@/models/Role.js";
import config from '@/config/app.config.js';
import { BadRequestError } from "@/response/error.response.js";
import { ROLES } from "@/enum/role.enum.js";
import Token from "@/models/Token.js";
import jwtService from "./jwt.service.js";
import createUserPayload from "@/utils/createUserPayload.js";
const ACCESS_TOKEN_SECRET = config.app.secret_access;
const REFRESH_TOKEN_SECRET = config.app.secret_refresh;

class authService {
    static checkExistingUser = async (username, email) => {
        const usernameAlreadyExists = await User.findOne({ username });
        if (usernameAlreadyExists) throw new BadRequestError('Username is already!');

        const emailAlreadyExists = await User.findOne({ email });
        if (emailAlreadyExists) throw new BadRequestError('Email is already!')
    }

    static checkExistingRole = (roles) => {
        for (let i = 0; i < roles.length; i++) {
            if (!ROLES.includes(roles[i])) {
                throw new BadRequestError(`Role ${roles[i]} does not exist`)
            }
        }
    };
    static register = async (userDto) => {
        const { username, email, password, roles, userAgent, ip } = userDto;
        if (!username || !email || !password || !roles) throw new BadRequestError('Invalid information to register!');
        await this.checkExistingUser(username, email);
        this.checkExistingRole(roles);

        let userRoles;
        if (roles) {
            const foundRoles = await Role.find({ name: { $in: roles } });
            userRoles = foundRoles.map((role) => role._id);
        } else {
            const role = await Role.findOne({ name: "user" });
            userRoles = [role._id];
        }

        const userCreated = await User.create({
            username,
            email,
            password,
            roles: userRoles
        });

        const userPayload = createUserPayload(userCreated)
        const accessToken = jwtService.createJWT({ payload: { user: userPayload } }, ACCESS_TOKEN_SECRET);

        const refreshToken = jwtService.createJWT({ payload: { user: userPayload } }, REFRESH_TOKEN_SECRET);

        const userToken = {
            accessTokens: [{ accessToken, signedAt: Date.now().toString() }],
            refreshToken,
            ip,
            userAgent,
            user: userCreated._id
        };

        await Token.create(userToken);
        return { user: userPayload, accessToken };
    }


    static login = async (valueLogin, password, reqInfor, res) => {
        const { ip, userAgent } = reqInfor;
        if (!valueLogin || !password) throw new BadRequestError('Please provide email/username amd password!');

        const user = await User.findOne({ $or: [{ email: valueLogin }, { username: valueLogin }] }).populate(
            "roles"
        );

        if (!user)
            throw new BadRequestError('Invalid Credentials');

        const isMatchPassword = await user.comparePassword(password);

        if (!isMatchPassword)
            throw new BadRequestError('Invalid Credentials');

        const userPayload = createUserPayload(user)
        const accessToken = jwtService.createJWT({ payload: { user: userPayload } }, ACCESS_TOKEN_SECRET);

        const userToken = await Token.findOne({ user: user._id });

        let refreshToken = '';
        if (userToken) {
            let oldTokens = userToken.accessTokens || [];
            if (oldTokens.length) {
                oldTokens = oldTokens.filter(t => {
                    const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
                    if (timeDiff < 86400) {
                        return t;
                    }
                });
            }
            jwtService.attachCookiestoResponse({ res, user: userPayload });
            await Token.findByIdAndUpdate(userToken._id, {
                accessTokens: [...oldTokens, { accessToken, signedAt: Date.now().toString() }],
            });
            return { userPayload, accessToken };
        }


        refreshToken = jwtService.createJWT({ payload: { user: userPayload } }, REFRESH_TOKEN_SECRET);

        const userTokenNew = {
            accessTokens: [{ accessToken, signedAt: Date.now().toString() }],
            refreshToken,
            ip,
            userAgent,
            user: user._id
        };

        await Token.create(userTokenNew);
        jwtService.attachCookiestoResponse({ res, user: userPayload });
        return { user: userPayload, accessToken };
    }

    static logout = async (req, res) => {
        await Token.findOneAndDelete({ user: req.user.userId });
        res.cookie('accessToken', 'logout', {
            httpOnly: true,
            expires: new Date(Date.now()),
        });
        res.cookie('refreshToken', 'logout', {
            httpOnly: true,
            expires: new Date(Date.now()),
        });
    }
}

export default authService;