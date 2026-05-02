import { Router } from 'express'

const viewsRouter = Router()

viewsRouter.get('/', (req, res) => {
  res.sendFile('/views/landing.html', { root: './frontend' })
})

viewsRouter.get('/login', (req, res) => {
  res.sendFile('/views/login.html', { root: './frontend' })
})

viewsRouter.get('/home', (req, res) => {
  res.sendFile('/views/home.html', { root: './frontend' })
})

viewsRouter.get('/movie:id', (req, res) => {
  res.sendFile('/views/movie.html', { root: './frontend' })
})

export default viewsRouter
