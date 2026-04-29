import mongoose from "mongoose"

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la lista es obligatorio'],
    trim: true,
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
