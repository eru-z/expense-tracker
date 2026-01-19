import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "./config.js"

export const hashPassword = p => bcrypt.hash(p,10)
export const comparePassword = (p,h) => bcrypt.compare(p,h)

export const generateToken = p => jwt.sign(p, config.JWT_SECRET, { expiresIn:"15m" })
export const generateRefreshToken = p => jwt.sign(p, config.JWT_REFRESH_SECRET, { expiresIn:"7d" })
