import { Router } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from "../models/User.js";

/**
 * @description Router para la gestión de autenticación.
 * Centraliza las operaciones de inicio de sesión y validación de identidad.
 */
const authRouter = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecretkey';

/**
 * @summary Inicia sesión de un usuario y genera un token de acceso.
 * @description Valida las credenciales enviadas (username/password), comprueba la existencia del usuario y compara el hash de la contraseña.
 * Si es exitoso, emite un JSON Web Token (JWT) con una validez de 24 horas.
 * @param {express.Request} req - Objeto de petición. Espera `username` y `password` en el body.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Función Next para delegar errores al controlador global.
 * @returns {Promise<void>} Responde con un token JWT en caso de éxito o un error 401/400 en caso de fallo.
 */
authRouter.post('/', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validación de presencia de campos obligatorios
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        error: 'MissingCredentials',
        message: 'Username and password are required.',
        cause: 'unknown'
      });
    }

    // Búsqueda del usuario en la base de datos
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        error: 'InvalidCredentials',
        message: 'Username or password is incorrect.',
        cause: 'unknown'
      });
    }

    // Verificación de la contraseña mediante comparación de hashes (Bcrypt)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        error: 'InvalidCredentials',
        message: 'Username or password is incorrect.',
        cause: 'unknown'
      });
    }

    // Generación del token con payload (id, username, role)
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
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
