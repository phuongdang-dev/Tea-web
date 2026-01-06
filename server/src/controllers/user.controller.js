import { StatusCodes } from "http-status-codes"
import ms from "ms"
import { env } from "process"
import User from "~/models/user.model"
import { JwtProvider } from "~/providers/JwtProvider"
import { userService } from "~/services/user.service"

const viewAnyProfile = async (req, res, next) => {
    try {
        const Users = await User.find()
        res.status(200).json(Users)
    } catch (error) {
        next(error)
    }
}

const register = async (req, res, next) => {
    try {
        const newUser = await userService.createUser(req.body)
        res.status(StatusCodes.CREATED).json(newUser)
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const user = await userService.login(req.body)
        const userInfo = { _id: user._id, email: user.usr_email, role: user.usr_role }

        const accessToken = await JwtProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            env.ACCESS_TOKEN_LIFE
        )

        const refreshToken = await JwtProvider.generateToken(
            userInfo,
            env.REFRESH_TOKEN_SECRET_SIGNATURE,
            env.REFRESH_TOKEN_LIFE
        )

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: ms('14 days')
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: ms('14 days')
        })

        res.status(StatusCodes.OK).json(user)
    } catch (error) {
        next(error)
    }
}

const viewMyProfile = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.jwtDecoded._id)
        res.status(StatusCodes.OK).json(user)
    } catch (error) {
        next(error)
    }
}


const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id)
        if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
        res.status(StatusCodes.OK).json(user)
    } catch (error) {
        next(error)
    }
}

const updateUser = async (req, res, next) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body)
        if (!updatedUser) return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
        res.status(StatusCodes.OK).json(updatedUser)
    } catch (error) {
        next(error)
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const deletedUser = await userService.deleteUser(req.params.id)
        if (!deletedUser) return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
        res.status(StatusCodes.OK).json({ message: 'User deleted successfully' })
    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        res.status(StatusCodes.OK).json({ loggedOut: true })
    } catch (error) {
        next(error)
    }
}

export const userController = {
    viewAnyProfile,
    register,
    login,
    viewMyProfile,
    getUserById,
    updateUser,
    deleteUser,
    logout
}