const express = require('express')
const viewsRouter = express.Router()
const viewsController = require('../controllers/viewsController')
viewsRouter.use(express.static(__dirname + '/styles'))

viewsRouter.get(['/'], viewsController.mainPage)
viewsRouter.get('/create', viewsController.createPost)
viewsRouter.get('/myposts', viewsController.myPosts)
viewsRouter.get('/favorites', viewsController.myFavorites)
viewsRouter.get('/:author', viewsController.getAuthorsPosts)

module.exports = viewsRouter