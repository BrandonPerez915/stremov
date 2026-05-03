import { Router } from "express";

import usersRouter from "./users.js";
import listsRouter from "./lists.js";
import moviesRouter from "./movies.js";
import authRouter from "./authRouter.js";

const apiRouter = Router()

apiRouter.use('/users', usersRouter)
apiRouter.use('/lists', listsRouter)
apiRouter.use('/movies', moviesRouter)
apiRouter.use('/login', authRouter)

export default apiRouter
