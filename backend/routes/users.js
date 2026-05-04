import { Router } from 'express'

import * as userController from '../controllers/userController.js'
import registerRequest from '../middlewares/registerRequest.js'
import errorHandler from '../middlewares/errorHandler.js'
import authMiddleware from '../middlewares/authMiddleware.js';


const usersRouter = new Router()

usersRouter.route('/')
  .post(registerRequest, userController.postUser)

usersRouter.route('/:name')
  .get(userController.getUser)
  .patch(authMiddleware, userController.patchUser)
  .delete(authMiddleware, userController.deleteUser)

usersRouter.route('/:name/follow')
  .post(authMiddleware, userController.followUser)
  .delete(authMiddleware, userController.unfollowUser)

usersRouter.route('/:name/followers')
  .get(userController.getFollowers)

usersRouter.route('/:name/following')
  .get(userController.getFollowing)

usersRouter.use(errorHandler)

export default usersRouter
