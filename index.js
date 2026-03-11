const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')

const app = express()

const blogSchema = mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
})

const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = 'mongodb+srv://jonttuuh_db_user:8VMhBKz23FcAtsfB@cluster0.xuiqvvv.mongodb.net/blogApp?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(mongoUrl, { family: 4 })

app.use(express.json())

app.get('/api/blogs', (request, response) => {
    Blog.find({}).then((blogs) => {
        response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
    const blog = new Blog(request.body)

    blog.save().then((result) => {
        response.status(201).json(result)
    })
})

const PORT = 3003
app.listen(PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
    console.log(`Server running on port ${PORT}`)
})