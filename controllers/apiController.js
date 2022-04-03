const validator = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Post = require('../models/Post')
require('dotenv').config()

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET})

const getUsers = async (req, res) => {
    try {
        const allUsers = await User.find({})
        res.json(allUsers)
    } catch (e) {if(e) res.json({error: e})}
}

const createUser = async (req, res) => {
    const errors = validator.validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()})
    try {
        const {username, email, password} = req.body
        const userExists = await User.findOne({username})
        if(userExists) {return res.status(400).json({error: 'Such user already exists'})}
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({username, email, password: hashedPassword})
        await newUser.save()
        res.json({message: 'User has been created'})
    } catch (e) {if(e) res.json({error: e})}
}

const login = async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({error: 'Such user doesnt exist'})
        const validPassword = await bcrypt.compare(password, user.password)
        if(!validPassword) return res.status(400).json({error: 'Invalid password'})
        const token = jwt.sign(JSON.stringify(user), process.env.JWT_SECRET)
        res.status(200).json({message: 'Logged in', token})
    } catch (e) {
        if(e) console.log(e)
    }
}

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
        res.json(posts)
    } catch (e) {if(e) res.json({message: e})}
}

const createPost = async (req, res) => {
    const errors = validator.validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({error: errors.array()})
    try {
        const {title, content, hashtags, token, imgUrl} = req.body
        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET)
        const newPost = new Post({title, content, hashtags, imgUrl, date: new Date(), author: tokenVerified._id})
        await newPost.save()
        res.json({message: 'New post created!'})
    } catch (e) {if(e) res.json({message: e})}
}

const updatePost = async (req, res) => {
    try {
        const {id, title, content, hashtags} = req.body
        if(!title) return res.json({error: 'Please enter the title'})
        if(!content) return res.json({error: 'Please enter the content'})
        await Post.findOneAndUpdate({_id: id}, {$set: {title, content, hashtags}})
        res.json({message: 'Info updated'})
    } catch (e) {
        if(e) res.json({message: e})
    }
}

const deletePost = async (req, res) => {
    try {
        const {id} = req.body
        await Post.findOneAndDelete({_id: id})
        res.json({message: 'Post deleted'})
    } catch (e) {
        if(e) res.json({message: e})
    }
}

const getMyPosts = async (req, res) => {
    const {token} = req.body
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
    if(!verifiedToken) return res.status(400).json({error: 'Access denied'})
    const myPosts = await Post.find({author: verifiedToken._id})
    res.status(200).json(myPosts)
}

const addToFavorites = async (req, res) => {
    const {token, postId} = req.body
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
    if(!verifiedToken) return res.status(400).json({error: 'Access denied'})
    let user = await User.findOne({_id: verifiedToken._id})
    let favorites = user.favorites
    if(!favorites.includes(postId)) favorites.push(postId)
    await User.findOneAndUpdate({_id: verifiedToken._id}, {$set: {favorites}})
    res.status(200).json({message: 'Added to favorites'})
}

const getMyFavorites = async (req, res) => {
    const {token} = req.body
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
    if(!verifiedToken) return res.status(400).json({error: 'Access denied'})
    await User.find({_id: verifiedToken._id}).populate('favorites').exec(async (err, data) => {
        if(err) console.log('Error', err)
        else {
            let userAndPosts = [...data]
            await User.find({}).then(result => {
                userAndPosts[0].favorites.forEach(item => {
                    item._doc.author = result.filter(user => user._id.toString() === item.author.toString())[0]
                })
            })
            res.status(200).json({userAndPosts})
        }
    })
}

const deleteFromMyFavorites = async (req, res) => {
    const {token, postId} = req.body
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
    if(!verifiedToken) return res.status(400).json({error: 'Access denied'})
    const user = await User.findOne({_id: verifiedToken._id})
    let favorites = user.favorites
    favorites.splice(favorites.indexOf(postId), 1)
    await User.findOneAndUpdate({_id: verifiedToken._id}, {$set: {favorites}})
    res.status(200).json({message: 'Post deleted from favorites'})
}

const getCurrentUser = async (req, res) => {
    const {token} = req.body
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
    if(!verifiedToken) return res.status(400).json({error: 'Access denied'})
    res.status(200).json(verifiedToken)
}

const uploadImage = async (req, res) => {
    const img = req.files.image
    const DatauriParser = require('datauri/parser');
    const parser = new DatauriParser();
    const content = parser.format('.png', img.data)
    cloudinary.uploader.upload(content.content, {resource_type: 'image'})
        .then(response => res.json({imageData: response, message: 'Image uploaded'}))
        .catch(e => {if(e) console.log(e)})
}

module.exports = {getUsers, createUser, getPosts, createPost, updatePost, deletePost, login, getMyPosts, getCurrentUser, uploadImage, getMyFavorites, deleteFromMyFavorites, addToFavorites}