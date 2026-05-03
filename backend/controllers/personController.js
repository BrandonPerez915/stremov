import Person from '../models/Person.js';

import { StatusCodes } from '../config/constants.js';
import { AppError } from './errorController.js';

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