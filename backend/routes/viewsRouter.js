import { Router } from 'express'

/**
 * @description Router de Vistas (Frontend).
 * Se encarga de servir los archivos HTML estáticos para la navegación del cliente.
 * A diferencia del apiRouter, este responde con documentos en lugar de datos JSON.
 */
const viewsRouter = Router()

/**
 * @route GET /
 * @summary Ruta raíz. Sirve la página de inicio.
 */
viewsRouter.get('/', (req, res) => {
  res.sendFile('/views/home.html', { root: './frontend' })
})

/**
 * @route GET /login
 * @summary Sirve la página de inicio de sesión.
 */
viewsRouter.get('/login', (req, res) => {
  res.sendFile('/views/auth.html', { root: './frontend' })
})

/**
 * @route GET /register
 * @summary Sirve la página de creación de cuenta.
 */
viewsRouter.get('/register', (req, res) => {
  res.sendFile('/views/auth.html', { root: './frontend' })
})

/**
 * @route GET /home
 * @summary Redirección o acceso directo al dashboard principal.
 */
viewsRouter.get('/home', (req, res) => {
  res.sendFile('/views/home.html', { root: './frontend' })
})

viewsRouter.get('/your-lists', (req, res) => {
  res.sendFile('/views/yourLists.html', { root: './frontend' })
})

viewsRouter.get('/list/:id', (req, res) => {
  res.sendFile('/views/listDetail.html', { root: './frontend' })
})

viewsRouter.get('/lists/:id', (req, res) => {
  res.sendFile('/views/listDetail.html', { root: './frontend' })
})

/**
 * @route GET /movie/:id
 * @summary Sirve la vista de detalle de una película.
 */
viewsRouter.get('/movie/:id', (req, res) => {
  res.sendFile('/views/movie.html', { root: './frontend' })
})

export default viewsRouter
