import mongoose from 'mongoose';

import List from '../models/List.js';
import User from '../models/User.js';

import { StatusCodes } from '../config/constants.js';
import { AppError } from './errorController.js';

/**
 * @summary Crea una nueva lista para un usuario.
 * @description Crea un documento de lista vinculándolo al usuario autenticado y actualiza el perfil del usuario para incluir la referencia a esta nueva lista.
 * @param {import('express').Request} req - Objeto de petición. Espera `name` y `description` en req.body; `userId` debe estar presente por auth.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next para delegar errores.
 * @returns {Promise<void>} Responde con JSON de la lista creada.
 */
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

/**
 * @summary Obtiene los detalles de una lista específica del usuario.
 * @description Recupera una lista asegurando que pertenezca al usuario solicitante y puebla la información básica de las películas contenidas.
 * @param {import('express').Request} req - Objeto de petición. Espera `id` en params y `userId` (auth).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Responde con la lista y sus películas pobladas.
 */
async function getList(req, res, next) {
  const { id } = req.params;
  const { userId } = req;

  try {
    const list = await List.findOne({ _id: id, owner: userId })
      .select('name description movies owner')
      .populate('owner', 'username avatarUrl')
      .populate('movies', 'title posterUrl tmdbId imdbScore genres overview releaseDate runtime runtimeFormatted rated');

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

/**
 * @summary Obtiene todas las listas de un usuario específico.
 * @description Retorna un resumen de todas las listas creadas por un usuario, incluyendo el conteo de películas en cada una.
 * @param {import('express').Request} req - Objeto de petición. Espera `userId` en params.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista de colecciones del usuario.
 */
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

/**
 * @summary Obtiene la lista especial de "Favoritos" de un usuario.
 * @description Busca específicamente la lista marcada con el nombre 'Favoritos' para el usuario indicado y puebla sus elementos.
 * @param {import('express').Request} req - Objeto de petición. Espera `userId` en params.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Objeto de la lista de favoritos.
 */
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

/**
 * @summary Actualiza los metadatos o el contenido de una lista.
 * @description Permite editar el nombre, descripción o el arreglo completo de IDs de películas de una lista, validando siempre la propiedad del recurso.
 * @param {import('express').Request} req - Objeto de petición. Espera `id` en params y campos a actualizar en req.body.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Responde con la lista actualizada.
 */
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

/**
 * @summary Elimina una lista y remueve su referencia del usuario.
 * @description Ejecuta un borrado físico de la lista y utiliza `$pull` para limpiar la referencia del arreglo `lists` en el documento del usuario.
 * @param {import('express').Request} req - Objeto de petición. Espera `id` en params y `userId` (auth).
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Responde con confirmación del borrado.
 */
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

/**
 * @summary Agrega una película a una lista existente.
 * @description Inserta un ID de película en el arreglo `movies` de la lista usando `$addToSet` para prevenir entradas duplicadas.
 * @param {import('express').Request} req - Objeto de petición. Espera `id` (lista) y `movieId` en req.params.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Responde con mensaje de éxito.
 */
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

    await List.findByIdAndUpdate(id, { $addToSet: { movies: movieId } });

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Película agregada a la lista con éxito'
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Remueve una película de una lista.
 * @description Utiliza `$pull` para eliminar la referencia de una película específica dentro del arreglo de una lista, validando propiedad.
 * @param {import('express').Request} req - Objeto de petición. Espera `id` (lista) y `movieId` en req.params.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Responde con mensaje de éxito.
 */
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
