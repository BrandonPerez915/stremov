import mongoose from 'mongoose';

import List from '../models/List.js';
import User from '../models/User.js';

import { StatusCodes } from '../config/constants.js';
import { AppError } from './errorController.js';
import { getRandomColor } from '../utils/random.js';

async function postList(req, res, next) {
  const { name } = req.body
  const { userId } = req;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', StatusCodes.NOT_FOUND, 'UserNotFound');
    }

    const list = await List.create({
      name,
      owner: userId
    });

    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Lista creada con éxito',
      list: {
        id: list._id,
        name: list.name,
        movies: list.movies
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getList(req, res, next) {
  const listName = req.params.name;
  const { userId } = req;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', StatusCodes.NOT_FOUND, 'UserNotFound');
    }

    const lists = await List.findOne({ owner: userId, name: listName }).select('name movies');
    if (!lists) {
      throw new AppError('Lista no encontrada', StatusCodes.NOT_FOUND, 'ListNotFound');
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Listas obtenidas con éxito',
      lists
    });
  } catch (error) {
    return next(error);
  }
}

async function patchList(req, res, next) {
  const listName = req.params.name;
  const { userId } = req;

  const { name, movies } = req.body;

  if (!name && !movies) {
    const error = new AppError('Al menos un campo (name, movies) debe ser proporcionado para actualizar', StatusCodes.BAD_REQUEST, 'ValidationError');
    return next(error);
  }

  try {
    const list = await List.findOne({ owner: userId, name: listName });

    if (!list) {
      const error = new AppError('Lista no encontrada', StatusCodes.NOT_FOUND, 'ListNotFound');
      return next(error);
    }

    if (name) list.name = name;
    if (movies) list.movies = movies;

    await list.save();

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Lista actualizada con éxito',
      list: {
        id: list._id,
        name: list.name,
        movies: list.movies
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteList(req, res, next) {
  const listName = req.params.name;
  const { userId } = req;

  try {
    const list = await List.findOneAndDelete({ owner: userId, name: listName });

    if (!list) {
      const error = new AppError('Lista no encontrada', StatusCodes.NOT_FOUND, 'ListNotFound');
      return next(error);
    }

    await User.findByIdAndUpdate(userId, { $pull: { lists: list._id } });

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Lista eliminada con éxito',
      list: {
        id: list._id,
        name: list.name,
      }
    });
  } catch (error) {
    return next(error);
  }
}

export {
  postList,
  getList,
  patchList,
  deleteList
};
