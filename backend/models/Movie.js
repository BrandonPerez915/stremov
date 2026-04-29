import mongoose from "mongoose"

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
  },
  releaseYear: {
    type: Number,
    required: [true, 'El año de lanzamiento es obligatorio'],
    min: [1888, 'El año debe ser mayor o igual a 1888']
  },
  genre: {
    type: String,
    required: [true, 'El género es obligatorio'],
    trim: true,
  },
  director: {
    type: String,
    required: [true, 'El director es obligatorio'],
    trim: true,
  },
  posterUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x450?text=No+Image'
  }
})

const Movie = mongoose.model('Movie', movieSchema)

export default Movie
