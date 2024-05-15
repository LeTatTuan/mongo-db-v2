import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import config from '@/config/app.config.js';
import { StatusCodes } from "http-status-codes";
const SECRET = config.app.secret_jwt;

const register = async (userDto) => {
    const { username, email, password, roles } = userDto;

    const newUser = new User({
        username,
        email,
        password
    });

    if (roles) {
        const foundRoles = await Role.find({ name: { $in: roles } });
        newUser.roles = foundRoles.map((role) => role._id);
    } else {
        const role = await Role.findOne({ name: "user" });
        newUser.roles = [role._id];
    }

    try {

        const savedUser = await newUser.save();
        const token = jwt.sign({ id: savedUser._id }, SECRET, {
            expiresIn: 86400,
        });
        newUser.tokens = [{ token, signedAt: Date.now().toString() }]
        await newUser.save();
        return {
            statusCode: StatusCodes.CREATED,
            message: '',
            data: savedUser,
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message,
            data: {},
        }
    }
};


const login = async (email, password) => {

    const user = await User.findOne({ email: email }).populate(
        "roles"
    );

    if (!user)
        return {
            statusCode: StatusCodes.NOT_FOUND,
            message: 'Invalid email or password',
            data: {},
        }

    const isMatchPassword = await user.comparePassword(password)

    if (!isMatchPassword)
        return {
            statusCode: StatusCodes.BAD_REQUEST,
            message: 'Invalid email or password',
            data: {},
        }

    const token = jwt.sign({ id: user._id }, SECRET, {
        expiresIn: 86400,
    });

    let oldTokens = user.tokens || [];
    if (oldTokens.length) {
        oldTokens = oldTokens.filter(t => {
            const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
            if (timeDiff < 86400) {
                return t;
            }
        });
    }
    try {
        await User.findByIdAndUpdate(user._id, {
            tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
        });
        return {
            statusCode: StatusCodes.OK,
            message: 'Success',
            data: { user, token },
        }
    } catch (error) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message,
            data: {},
        }
    }
};

const logout = async (token) => {
    if (!token)
        return
    const decoded = jwt.decode(token, SECRET);
    const { exp, id } = decoded;
    if (exp < (new Date().getTime() + 1) / 1000) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Token id died!' });
    }
    req.userId = id;

    const user = await User.findById(decoded.id, { password: 0 });
    if (!user)
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });

    await User.findByIdAndUpdate(decoded.id, { tokens: [] });
    return res.status(StatusCodes.OK).json({ message: 'Sign out successfully!' });

}
const authService = {
    register, login, logout,
}
export default authService;