import mongoose from "mongoose";
 
const personSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  }
});
 
const Person = mongoose.model('Person', personSchema);
 
export default Person;
 