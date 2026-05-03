import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'La película es obligatoria']
  },
  score: {
    type: Number,
    required: [true, 'La calificación es obligatoria'],
    min: [1, 'La calificación mínima es 1'],
    max: [10, 'La calificación máxima es 10']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'El título no puede superar los 100 caracteres']
  },
  body: {
    type: String,
    trim: true,
    maxlength: [2000, 'La reseña no puede superar los 2000 caracteres']
  }
}, {
  timestamps: true
});

//un usuario puede dejar SOLO una review o rating por película
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;