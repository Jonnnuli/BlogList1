const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'Blog 1',
        author: 'Jonna',
        url: 'http://example.com/1',
        likes: 4,
    },
    {
        title: 'Blog 2',
        author: 'Jenna',
        url: 'http://example.com/2',
        likes: 3,
    },
]

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }

    return blogs.reduce((favorite, blog) => {
        return blog.likes > favorite.likes ? blog : favorite
    })
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(b => b.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    initialBlogs,
    blogsInDb,
    usersInDb,
}