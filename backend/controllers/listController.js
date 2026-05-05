import mongoose from 'mongoose';

import List from '../models/List.js';
import User from '../models/User.js';

import { StatusCodes } from '../config/constants.js';
import { AppError } from './errorController.js';
//import { getRandomColor } from '../utils/random.js';

async function postList(req, res, next) {
  const { name, description } = req.body
  const { userId } = req;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', StatusCodes.NOT_FOUND, 'UserNotFound');
    }

    const list = await List.create({
      name,
      description,
      owner: userId
    });

    await User.findByIdAndUpdate(userId, { $push: { lists: list._id } });

    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Lista creada con éxito',
      list: {
        id: list._id,
        name: list.name,
        description: list.description,
        movies: list.movies
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getList(req, res, next) {
  const { id } = req.params;
  const { userId } = req;

  try {
    const list = await List.findOne({ _id: id, owner: userId })
      .select('name movies')
      .populate('movies', 'title posterUrl');

    if (!list) {
      throw new AppError('Lista no encontrada', StatusCodes.NOT_FOUND, 'ListNotFound');
    }
 
    return res.status(StatusCodes.OK).json({
      status: 'success',
      list
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserLists(req, res, next) {
  const { userId } = req.params;
 
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', StatusCodes.NOT_FOUND, 'UserNotFound');
    }
 
    const lists = await List.find({ owner: userId }).select('name movies');
 
    return res.status(StatusCodes.OK).json({
      status: 'success',
      total: lists.length,
      lists
    });
  } catch (error) {
    return next(error);
  }
}
 
async function getFavoriteList(req, res, next) {
  const { userId } = req.params;
 
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', StatusCodes.NOT_FOUND, 'UserNotFound');
    }
 
    const list = await List.findOne({ owner: userId, name: 'Favoritos' })
      .populate('movies', 'title posterUrl');
 
    if (!list) {
      throw new AppError('Lista de favoritos no encontrada', StatusCodes.NOT_FOUND, 'ListNotFound');
    }
 
    return res.status(StatusCodes.OK).json({
      status: 'success',
      list
    });
  } catch (error) {
    return next(error);
  }
}


async function patchList(req, res, next) {
  const { id } = req.params;
  const { userId } = req;
  const { name, description, movies } = req.body;
 
  if (!name && !movies && !description) {
    return next(new AppError('Al menos un campo (name, description, movies) debe ser proporcionado para actualizar', StatusCodes.BAD_REQUEST, 'ValidationError'));
  }
 
  try {
    const list = await List.findOne({ _id: id, owner: userId });
 
    if (!list) {
      throw new AppError('Lista no encontrada', StatusCodes.NOT_FOUND, 'ListNotFound');
    }
 
    if (name) list.name = name;
    if (description) list.description = description;
    if (movies) list.movies = movies;
 
    await list.save();
 
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Lista actualizada con éxito',
      list: {
        id: list._id,
        name: list.name,
        description: list.description,
        movies: list.movies
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteList(req, res, next) {
  const { id } = req.params;
  const { userId } = req;
 
  try {
    const list = await List.findOneAndDelete({ _id: id, owner: userId });
 
    if (!list) {
      throw new AppError('Lista no encontrada', StatusCodes.NOT_FOUND, 'ListNotFound');
    }
 
    await User.findByIdAndUpdate(userId, { $pull: { lists: list._id } });
 
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Lista eliminada con éxito',
      list: {
        id: list._id,
        name: list.name
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function addMovieToList(req, res, next) {
  const { id, movieId } = req.params;
  const { userId } = req;
 
  try {
    const list = await List.findOne({ _id: id, owner: userId });
    if (!list) {
      throw new AppError('Lista no encontrada', StatusCodes.NOT_FOUND, 'ListNotFound');
    }
 
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new AppError('Película no encontrada', StatusCodes.NOT_FOUND, 'MovieNotFound');
    }
 
    //$addToSet para evitar duplicados pq no se puede guardar una película dos veces en una misma lista
    await List.findByIdAndUpdate(id, { $addToSet: { movies: movieId } });
 
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Película agregada a la lista con éxito'
    });
  } catch (error) {
    return next(error);
  }
}
 
async function removeMovieFromList(req, res, next) {
  const { id, movieId } = req.params;
  const { userId } = req;
 
  try {
    const list = await List.findOne({ _id: id, owner: userId });
    if (!list) {
      throw new AppError('Lista no encontrada', StatusCodes.NOT_FOUND, 'ListNotFound');
    }
 
    await List.findByIdAndUpdate(id, { $pull: { movies: movieId } });
 
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Película eliminada de la lista con éxito'
    });
  } catch (error) {
    return next(error);
  }
}

export {
  postList,
  getList,
  getUserLists,
  getFavoriteList,
  patchList,
  deleteList,
  addMovieToList,
  removeMovieFromList
};
