import mongoose from "mongoose"

import User from "../models/User.js"
import List from "../models/List.js"

import { StatusCodes } from "../config/constants.js"
import { AppError } from "./errorController.js"
import { getRandomColor } from "../utils/random.js"

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
      name: 'Favoritos',
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

async function getUser(req, res, next) {
  const name = req.params.name;

  try {
    const user = await User.findOne({ username: name })
      .select(' -password -email -createdAt -updatedAt -__v')
      .populate('lists')
      .populate('following', 'username avatarUrl')
      .populate('followers', 'username avatarUrl');

    if (!user) {
      const error = new AppError(`No se encontró un usuario con el nombre '${name}'`, StatusCodes.NOT_FOUND, 'UserNotFound');
      return next(error);
    }
    return res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    return next(error);
  }
}

async function patchUser(req, res, next) {
  const name = req.params.name;

  const { username, password, email, avatarUrl } = req.body;

  if (!username && !password && !email && !avatarUrl) {
    const error = new AppError('Al menos un campo (username, password, email, avatarUrl) debe ser proporcionado para actualizar', StatusCodes.BAD_REQUEST, 'ValidationError');
    return next(error);
  }

  try {
    const user = await User.findOne({ username: name })

    if (!user) {
      const error = new AppError(`No se encontró un usuario con el nombre '${name}'`, StatusCodes.NOT_FOUND, 'UserNotFound');
      return next(error);
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (avatarUrl) user.avatarUrl = avatarUrl;

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

async function deleteUser(req, res, next) {
  const name = req.params.name;

  try {
    const user = await User.findOneAndDelete({ username: name });

    if (!user) {
      const error = new AppError(`No se encontró un usuario con el nombre '${name}'`, StatusCodes.NOT_FOUND, 'UserNotFound');
      return next(error);
    }
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

async function followUser(req, res, next) {
  const { name } = req.params;
  const userId = req.userId || req.headers['user-id'];
 
  try {
    const targetUser = await User.findOne({ username: name });
    if (!targetUser) {
      throw new AppError(`No se encontró un usuario con el nombre '${name}'`, StatusCodes.NOT_FOUND, 'UserNotFound');
    }
 
    if (targetUser._id.toString() === userId.toString()) {
      throw new AppError('No puedes seguirte a ti mismo', StatusCodes.BAD_REQUEST, 'ValidationError');
    }
 
    //verificar si ya lo sigue
    const alreadyFollowing = targetUser.followers.some(id => id.toString() === userId.toString());
    if (alreadyFollowing) {
      throw new AppError('Ya sigues a este usuario', StatusCodes.CONFLICT, 'AlreadyFollowing');
    }
 
    //actualizar ambos usuarios en paralelo
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
 
async function unfollowUser(req, res, next) {
  const { name } = req.params;
  const userId = req.userId || req.headers['user-id'];
 
  try {
    const targetUser = await User.findOne({ username: name });
    if (!targetUser) {
      throw new AppError(`No se encontró un usuario con el nombre '${name}'`, StatusCodes.NOT_FOUND, 'UserNotFound');
    }
 
    //verificar si sí lo sigue
    const isFollowing = targetUser.followers.some(id => id.toString() === userId.toString());
    if (!isFollowing) {
      throw new AppError('No sigues a este usuario', StatusCodes.BAD_REQUEST, 'ValidationError');
    }
 
    //actualizar ambos usuarios en paralelo
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
 
async function getFollowers(req, res, next) {
  const { name } = req.params;
 
  try {
    const user = await User.findOne({ username: name })
      .select('followers')
      .populate('followers', 'username avatarUrl');
 
    if (!user) {
      throw new AppError(`No se encontró un usuario con el nombre '${name}'`, StatusCodes.NOT_FOUND, 'UserNotFound');
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


async function getFollowing(req, res, next) {
  const { name } = req.params;
 
  try {
    const user = await User.findOne({ username: name })
      .select('following')
      .populate('following', 'username avatarUrl');
 
    if (!user) {
      throw new AppError(`No se encontró un usuario con el nombre '${name}'`, StatusCodes.NOT_FOUND, 'UserNotFound');
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
