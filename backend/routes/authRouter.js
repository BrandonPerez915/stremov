import { Router } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from "../models/User.js";

const authRouter = Router()
const JWT_SECRET = process.env.JWT_SECRET

authRouter.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        error: 'MissingCredentials',
        message: 'Username and password are required.',
        cause: 'unknown'
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        error: 'InvalidCredentials',
        message: 'Username or password is incorrect.',
        cause: 'unknown'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        error: 'InvalidCredentials',
        message: 'Username or password is incorrect.',
        cause: 'unknown'
      });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login exitoso',
      token: token
    });

  } catch (error) {
    next(error);
  }
});

export default authRouter
