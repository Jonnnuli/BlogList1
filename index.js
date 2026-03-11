const app = require('./app')
//const express = require('express')
//const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')

//const app = express()

/*const blogSchema = mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
})*/

//const Blog = mongoose.model('Blog', blogSchema)

//mongoose.connect(mongoUrl, { family: 4 })

// app.use(express.json())

/*app.get('/api/blogs', (request, response) => {
    Blog.find({}).then((blogs) => {
        response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
    const blog = new Blog(request.body)

    blog.save().then((result) => {
        response.status(201).json(result)
    })
}) */

//const PORT = 3003
app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})