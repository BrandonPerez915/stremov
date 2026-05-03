import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import { connectDB } from './config/db.js'
import apiRouter from './routes/apiRouter.js'
import viewsRouter from './routes/viewsRouter.js'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
connectDB()

app.use(cors())
app.use(express.json())
app.use('/views', express.static(path.join(__dirname, '../frontend/views')))
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')))
app.use('/components', express.static(path.join(__dirname, '../frontend/components')))
app.use('/scripts', express.static(path.join(__dirname, '../frontend/scripts')))
// Ruta temporal para servir los mocks, se puede eliminar cuando se integre el frontend con el backend
app.use('/mocks', express.static(path.join(__dirname, '../frontend/mocks')))

app.use('/api', apiRouter)
app.use('/', viewsRouter)

app.listen(3000, () => console.log("Servidor corriendo en el puerto 3000"))
