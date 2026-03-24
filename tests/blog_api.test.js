const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

const testBlogs = [
    {
        _id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        __v: 0
    },
    {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
    },
    {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        __v: 0
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of testBlogs) {
        await new Blog(blog).save()
    }
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, testBlogs.length)
})

test('blog id is named id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]
    assert.ok(blog.id)
    assert.strictEqual(blog._id, undefined)
})

test('succeeds with valid data', async () => {
    const newBlog = {
        title: 'test title',
        author: 'test author',
        url: 'https://test.fi',
        likes: 8
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, testBlogs.length + 1)

    const titles = response.body.map(blog => blog.title)
    assert(titles.includes('test title'))
})

test('if missing likes, set to 0', async () => {
    const newBlog = {
        title: 'Blog with no likes',
        author: 'test author',
        url: 'https://test.fi'
    }

    const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, 0)
})

test('title is not added', async () => {
    const newBlog = {
        author: 'test author1',
        url: 'https://test.fi',
        likes: 6
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, testBlogs.length)
})

test('url is not added', async () => {
    const newBlog = {
        title: 'No URL added',
        author: 'test author2',
        likes: 5
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, testBlogs.length)
})

after(async () => {
    await mongoose.connection.close()
})