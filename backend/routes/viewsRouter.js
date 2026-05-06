import { Router } from 'express'

const viewsRouter = Router()

viewsRouter.get('/', (req, res) => {
  res.sendFile('/views/home.html', { root: './frontend' })
})

viewsRouter.get('/login', (req, res) => {
  res.sendFile('/views/auth.html', { root: './frontend' })
})

viewsRouter.get('/register', (req, res) => {
  res.sendFile('/views/auth.html', { root: './frontend' })
})

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

viewsRouter.get('/movie/:id', (req, res) => {
  res.sendFile('/views/movie.html', { root: './frontend' })
})

export default viewsRouter
