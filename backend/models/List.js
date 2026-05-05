import mongoose from "mongoose"

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la lista es obligatorio'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'La descripción no puede superar los 300 caracteres']
  },
  movies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

const List = mongoose.model('List', listSchema)

export default List
