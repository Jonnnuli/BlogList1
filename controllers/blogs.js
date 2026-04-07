const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', (request, response) => {
    Blog.find({}).then(blogs => {
        response.json(blogs)
    })
})

blogsRouter.get('/:id', (request, response, next) => {
    Blog.findById(request.params.id)
        .then(blog => {
            if (blog) {
                response.json(blog)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const user = await User.findById(body.userId)

    if (!user) {
        return response.status(400).json({ error: 'userId missing or not valid' })
    }

    if (!body.title || !body.url) {
        return response.status(400).json({ error: 'No title or url added' })
    }

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes ?? 0,
        user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response, next) => {
    try {
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    } catch(error) {
        next(error)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const { title, author, url, likes } = request.body

    try {
        const blog = await Blog.findById(request.params.id)
        if (!blog) {
            return response.status(404).end()
        }

        blog.title = title
        blog.author = author
        blog.url = url
        blog.likes = likes

        const updatedBlog = await blog.save()
        response.json(updatedBlog)
    } catch(error) {
        next(error)
    }
})

module.exports = blogsRouter