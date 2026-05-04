import mongoose from "mongoose"

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true
  },
  imdbId: {
    type: String,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
  },
  overview: {
    type: String,
    trim: true
  },
  releaseDate: {
    type: String  //"YYYY-MM-DD"
  },
  releaseYear: {
    type: Number
  },
  runtime: {
    type: Number  //en minutos
  },
  runtimeFormatted: {
    type: String  //FORMATO"2h 28min"
  },
  rated: {
    type: String,
    trim: true    //"PG-13", "R", "G"
  },
  genres: [{
    type: String,
    trim: true
  }],
  originCountry: [{
    type: String
  }],
  languages: [{
    type: String
  }],
  imdbScore: {
    type: Number
  },
  awards: {
    type: String,
    trim: true
  },
  directors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  }],
  actors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  }],
  posterUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x450?text=No+Image'
  },
  backdropUrl: {
    type: String
  }
})

const Movie = mongoose.model('Movie', movieSchema)

export default Movie
