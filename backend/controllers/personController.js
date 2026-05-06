import Person from '../models/Person.js';

import { StatusCodes } from '../config/constants.js';
import { AppError } from './errorController.js';

/**
 * @summary Crea una nueva persona en la base de datos local.
 * @description Registra un documento de persona utilizando únicamente el nombre proporcionado en el cuerpo de la petición.
 * @param {import('express').Request} req - Objeto de petición. Espera `name` en req.body.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next para gestión de errores.
 * @returns {Promise<void>} Responde con el objeto de la persona creada.
 */
async function postPerson(req, res, next) {
  const { name } = req.body;

  try {
    const person = await Person.create({ name });

    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Persona creada con éxito',
      person
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Obtiene una persona por su ID de base de datos.
 * @description Busca un registro específico utilizando el ObjectId de MongoDB. Lanza un error 404 si no existe.
 * @param {import('express').Request} req - Objeto de petición. Espera `id` en req.params.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Responde con los datos de la persona encontrada.
 */
async function getPerson(req, res, next) {
  const { id } = req.params;

  try {
    const person = await Person.findById(id);

    if (!person) {
      throw new AppError('Persona no encontrada', StatusCodes.NOT_FOUND, 'PersonNotFound');
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      person
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Busca personas por coincidencia de nombre.
 * @description Realiza una búsqueda flexible utilizando una expresión regular (case-insensitive). Si no se provee un nombre, devuelve todos los registros ordenados alfabéticamente.
 * @param {import('express').Request} req - Objeto de petición. Acepta `name` opcional en req.query.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Lista de personas que coinciden con el criterio.
 */
async function searchPersons(req, res, next) {
  const { name } = req.query;

  try {
    const query = name
      ? { name: { $regex: name, $options: 'i' } }
      : {};

    const persons = await Person.find(query).sort({ name: 1 });

    return res.status(StatusCodes.OK).json({
      status: 'success',
      total: persons.length,
      persons
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Actualiza el nombre de una persona existente.
 * @description Modifica el campo `name` de un registro tras validar su existencia. Requiere que el nuevo nombre no sea nulo.
 * @param {import('express').Request} req - Objeto de petición. Espera `id` en params y `name` en req.body.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Responde con el objeto actualizado.
 */
async function patchPerson(req, res, next) {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    const error = new AppError('El campo name debe ser proporcionado para actualizar', StatusCodes.BAD_REQUEST, 'ValidationError');
    return next(error);
  }

  try {
    const person = await Person.findById(id);

    if (!person) {
      throw new AppError('Persona no encontrada', StatusCodes.NOT_FOUND, 'PersonNotFound');
    }

    person.name = name;
    await person.save();

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Persona actualizada con éxito',
      person
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * @summary Elimina permanentemente una persona de la base de datos local.
 * @description Ejecuta un borrado físico del documento basado en su ID único.
 * @param {import('express').Request} req - Objeto de petición. Espera `id` en req.params.
 * @param {import('express').Response} res - Objeto de respuesta.
 * @param {import('express').NextFunction} next - Middleware Next.
 * @returns {Promise<void>} Responde con un mensaje de éxito y los datos del registro eliminado.
 */
async function deletePerson(req, res, next) {
  const { id } = req.params;

  try {
    const person = await Person.findByIdAndDelete(id);

    if (!person) {
      throw new AppError('Persona no encontrada', StatusCodes.NOT_FOUND, 'PersonNotFound');
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Persona eliminada con éxito',
      person
    });
  } catch (error) {
    return next(error);
  }
}

export {
  postPerson,
  getPerson,
  searchPersons,
  patchPerson,
  deletePerson
};
