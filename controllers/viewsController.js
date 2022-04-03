const Post = require('../models/Post')
const User = require('../models/User')

const mainPage = async (req, res) => {
    await Post.find({}).populate('author').exec((err, posts) => {
        if(err) console.log('Error', err)
        else {
            let allHashtags = new Set()
            posts.filter(post => post.hashtags).map(post => post.hashtags.forEach(hashtag => allHashtags.add(hashtag.trim())))
            allHashtags = Array.from(allHashtags)
            let allPosts = [...posts].reverse()
            const elementsOnEachPage = 12
            const postsPages = []
            for(let i = 0 ; i < Math.ceil(posts.length / elementsOnEachPage) ; i++){
                let onePage = []
                for(let k = 0 ; k < elementsOnEachPage ; k++){
                    if(!allPosts[k]) break
                    onePage.push(allPosts[k])
                }
                postsPages.push(onePage)
                allPosts.splice(0, elementsOnEachPage)
            }
            res.render('main', {posts: postsPages[0], allPosts: JSON.stringify(posts), postsString: JSON.stringify(posts), pagination: JSON.stringify(postsPages), allHashtags})
        }
    })
}

const myPosts = async (req, res) => {res.render('myposts', {posts: [], postsString: JSON.stringify([])})}

const getAuthorsPosts = async (req, res) => {
    await Post.find({}).populate('author').exec((err, posts) => {
        if(err) console.log('Error', err)
        else {
            const postsByAuthorOldToNew = posts.filter(post => post.author._id.toString() === req.params.author)
            const postByAuthorNewToOld = [...postsByAuthorOldToNew].reverse()
            res.render('authorsposts', {posts: postByAuthorNewToOld, postsDescending: JSON.stringify(postByAuthorNewToOld), postsAscending: JSON.stringify(postsByAuthorOldToNew)})
        }
    })
}

const myFavorites = async (req, res) => {res.render('favorites')}

const createPost = (req,res) => {res.render('create')}

module.exports = {mainPage, createPost, myPosts, getAuthorsPosts, myFavorites}