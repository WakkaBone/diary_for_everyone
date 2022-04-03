const mongoose = require('mongoose')
const postSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String},
    hashtags: [{type: String, default: []}],
    imgUrl: {type: String, default: 'https://cld-jeans.com/static/backgrounds/default-img.jpg'},
    date: {type: Date},
    author: {ref: 'User', type: mongoose.Schema.Types.ObjectId}
})

const Post = mongoose.model('Post', postSchema)
module.exports = Post