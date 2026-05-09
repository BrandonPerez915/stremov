import mongoose from "mongoose"
import bcrypt from "bcrypt"

import User from "../models/User.js"
import List from "../models/List.js"
import Review from "../models/Review.js"

import { StatusCodes } from "../config/constants.js"
import { AppError } from "./errorController.js"
import { getRandomColor } from "../utils/random.js"
import { saveBase64Image, deleteUserAvatar } from "../services/imageService.js"

// --- GESTIÓN DE USUARIOS ---

/**
 * @summary Registra un nuevo usuario y configura su entorno inicial.
 * @description Crea el documento de usuario, genera un avatar dinámico basado en su nombre y crea automáticamente su lista predeterminada de "Favoritos".
 * @param {express.Request} req - Objeto de petición de Express. Espera `username`, `email` y `password` en req.body.
 * @param {express.Response} res - Objeto de respuesta de Express.
 * @param {express.NextFunction} next - Función Next para delegar errores.
 * @returns {Promise<void>} Responde con JSON del usuario creado (sin datos sensibles).
 */
async function postUser(req, res, next) {
  const { username, email, password } = req.body;

  try {
    const listId = new mongoose.Types.ObjectId();
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${getRandomColor()}&color=fff&size=128`;
    const user = await User.create({
      username: username,
      email: email,
      password: password,
      lists: [listId],
      avatarUrl: avatarUrl
    });

    const favoriteList = await List.create({
      _id: listId,
      name: 'Favorites',
      description: 'Your favorite movies and series in one place',
      owner: user._id
    });

    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Usuario creado con éxito',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });

  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene el perfil público de un usuario.
 * @description Busca un usuario por su nombre y realiza el "populate" de sus listas y redes sociales, excluyendo campos sensibles como contraseña o email.
 * @param {express.Request} req - Objeto de petición. Espera `name` en req.params.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Función Next para delegar errores.
 * @returns {Promise<void>} Responde con el objeto del usuario y sus relaciones.
 */
async function getUser(req, res, next) {
  const name = req.params.name;

  try {
    const user = await User.findOne({ username: name })
      .select(' -password -createdAt -updatedAt -__v')
      .populate('lists')
      .populate('following', 'username avatarUrl')
      .populate('followers', 'username avatarUrl');

    if (!user) {
      const error = new AppError(`No user with the name ‘${name}’ was found'`, StatusCodes.NOT_FOUND, 'UserNotFound');
      return next(error);
    }
    return res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Actualiza la información del perfil del usuario.
 * @description Permite modificar campos opcionales del perfil. Valida que el solicitante sea el propietario de la cuenta antes de guardar.
 * @param {express.Request} req - Objeto de petición. Espera `name` en params y campos opcionales en req.body. Requiere `req.userId` (auth).
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Función Next para delegar errores.
 * @returns {Promise<void>} Responde con los datos actualizados del usuario.
 */
async function patchUser(req, res, next) {
  const name = req.params.name;
  const { username, password, currentPassword, email, avatarUrl } = req.body;

  if (!username && !password && !email && !avatarUrl) {
    const error = new AppError('To update, you must fill in at least one field', StatusCodes.BAD_REQUEST, 'ValidationError');
    return next(error);
  }

  //si se quiere cambiar la contraseña, currentPassword es obligatorio
  if (password && !currentPassword) {
    return next(new AppError('You must enter your current password to change it', StatusCodes.BAD_REQUEST, 'ValidationError'));
  }

  try {
    const user = await User.findOne({ username: name })

    if (!user) {
      const error = new AppError(`No user with the name ‘${name}’ was found'`, StatusCodes.NOT_FOUND, 'UserNotFound');
      return next(error);
    }

    if (user._id.toString() !== req.userId.toString()) {
      throw new AppError('You do not have permission to edit this account', StatusCodes.UNAUTHORIZED, 'UnauthorizedError');
    }

    if (username) user.username = username;
    if (email) user.email = email;
    
    //si viene base64 guardamos en disco y la ruta en mongodb
    if (avatarUrl) {
      if (avatarUrl.startsWith('data:image')) {
        const savedPath = saveBase64Image(avatarUrl, user._id.toString());
        user.avatarUrl = savedPath;
      } else {
        user.avatarUrl = avatarUrl;
      }
    }

    if (password) {
      //verificar contraseña actual antes de permitir el cambio
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new AppError('La contraseña actual es incorrecta', StatusCodes.UNAUTHORIZED, 'InvalidPassword');
      }
      user.password = password; 
    }

    await user.save();

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Usuario actualizado con éxito',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Elimina la cuenta de un usuario.
 * @description Busca al usuario por nombre y verifica que quien realiza la petición sea el dueño de la cuenta antes de proceder con el borrado físico.
 * @param {express.Request} req - Objeto de petición. Espera `name` en params y `req.userId` (auth).
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Función Next para delegar errores.
 * @returns {Promise<void>} Responde con un mensaje de éxito y los datos del usuario eliminado.
 */
async function deleteUser(req, res, next) {
  const name = req.params.name;

  try {
    const user = await User.findOne({ username: name });

    if (!user) {
      const error = new AppError(`No user with the name ‘${name}’ was found'`, StatusCodes.NOT_FOUND, 'UserNotFound');
      return next(error);
    }

    if (user._id.toString() !== req.userId.toString()) {
      throw new AppError('You do not have permission to edit this account', StatusCodes.UNAUTHORIZED, 'UnauthorizedError');
    }

    //eliminar reviews, listas y referencias sociales
    await Promise.all([
      Review.deleteMany({ user: user._id }),
      List.deleteMany({ owner: user._id }),
      User.updateMany({ following: user._id }, { $pull: { following: user._id } }),
      User.updateMany({ followers: user._id }, { $pull: { followers: user._id } })
    ]);

    deleteUserAvatar(user._id.toString()); //eliminar foto de disco si existe

    await user.deleteOne();

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Usuario eliminado con éxito',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    return next(error);
  }
}

// --- RED SOCIAL (FOLLOWS) ---

/**
 * @summary Sigue a otro usuario.
 * @description Actualiza de forma atómica tanto la lista de "siguiendo" del solicitante como la lista de "seguidores" del objetivo. Valida duplicados y auto-seguimiento.
 * @param {express.Request} req - Objeto de petición. Espera `name` en params y `req.userId` (auth).
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Función Next para delegar errores.
 * @returns {Promise<void>} Responde con confirmación del seguimiento.
 */
async function followUser(req, res, next) {
  const { name } = req.params;
  const { userId } = req;

  try {
    const targetUser = await User.findOne({ username: name });
    if (!targetUser) {
      throw new AppError(`No user with the name ‘${name}’ was found'`, StatusCodes.NOT_FOUND, 'UserNotFound');
    }

    if (targetUser._id.toString() === userId.toString()) {
      throw new AppError('You cannot follow yourself', StatusCodes.BAD_REQUEST, 'ValidationError');
    }

    const alreadyFollowing = targetUser.followers.some(id => id.toString() === userId.toString());
    if (alreadyFollowing) {
      throw new AppError('You already follow this user', StatusCodes.CONFLICT, 'AlreadyFollowing');
    }

    await Promise.all([
      User.findByIdAndUpdate(userId,          { $addToSet: { following: targetUser._id } }),
      User.findByIdAndUpdate(targetUser._id,  { $addToSet: { followers: userId } })
    ]);

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: `Ahora sigues a ${name}`
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Deja de seguir a un usuario.
 * @description Remueve el vínculo de seguimiento entre dos usuarios utilizando el operador `$pull` en ambos documentos de forma simultánea.
 * @param {express.Request} req - Objeto de petición. Espera `name` en params y `req.userId` (auth).
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Función Next para delegar errores.
 * @returns {Promise<void>} Responde con confirmación de la acción.
 */
async function unfollowUser(req, res, next) {
  const { name } = req.params;
  const { userId } = req;

  try {
    const targetUser = await User.findOne({ username: name });
    if (!targetUser) {
      throw new AppError(`No user with the name ‘${name}’ was found'`, StatusCodes.NOT_FOUND, 'UserNotFound');
    }

    const isFollowing = targetUser.followers.some(id => id.toString() === userId.toString());
    if (!isFollowing) {
      throw new AppError('You do not follow this user', StatusCodes.BAD_REQUEST, 'ValidationError');
    }

    await Promise.all([
      User.findByIdAndUpdate(userId,          { $pull: { following: targetUser._id } }),
      User.findByIdAndUpdate(targetUser._id,  { $pull: { followers: userId } })
    ]);

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: `Dejaste de seguir a ${name}`
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene la lista de seguidores de un usuario.
 * @description Retorna un listado de usuarios que siguen al perfil especificado, incluyendo sus datos básicos de perfil (nombre y avatar).
 * @param {express.Request} req - Objeto de petición. Espera `name` en params.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Función Next para delegar errores.
 * @returns {Promise<void>} Responde con el total y el arreglo de seguidores.
 */
async function getFollowers(req, res, next) {
  const { name } = req.params;

  try {
    const user = await User.findOne({ username: name })
      .select('followers')
      .populate('followers', 'username avatarUrl');

    if (!user) {
      throw new AppError(`No user with the name ‘${name}’ was found'`, StatusCodes.NOT_FOUND, 'UserNotFound');
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      total: user.followers.length,
      followers: user.followers
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene la lista de usuarios seguidos por un perfil.
 * @description Retorna un listado de los perfiles que el usuario especificado está siguiendo actualmente.
 * @param {express.Request} req - Objeto de petición. Espera `name` en params.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Función Next para delegar errores.
 * @returns {Promise<void>} Responde con el total y el arreglo de usuarios seguidos.
 */
async function getFollowing(req, res, next) {
  const { name } = req.params;

  try {
    const user = await User.findOne({ username: name })
      .select('following')
      .populate('following', 'username avatarUrl');

    if (!user) {
      throw new AppError(`No user with the name ‘${name}’ was found'`, StatusCodes.NOT_FOUND, 'UserNotFound');
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      total: user.following.length,
      following: user.following
    });
  } catch (error) {
    return next(error);
  }
}

export {
  postUser,
  getUser,
  patchUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
}
