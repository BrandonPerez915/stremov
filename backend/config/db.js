import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    mongoose.connection.on('index', error => {
      if (error) console.error('Error al crear índice:', error)
    })
    console.log('Conexion exitosa')
  } catch (error) {
    console.log('Ocurrio un error', error.message)
    process.exit(1)
  }
}

export { connectDB }
