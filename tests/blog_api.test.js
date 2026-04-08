const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('../utils/list_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')
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

describe('addition of a new blog', () => {
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

describe('deletion of a blog', () => {
    test('deleted blog successfully', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        const ids = blogsAtEnd.map(b => b.id)
        assert(!ids.includes(blogToDelete.id))

        assert.strictEqual(
            blogsAtEnd.length,
            testBlogs.length - 1
        )
    })
})

describe('updating a blog', () => {
    test('updated likes successfully', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        const updatedData = { likes: blogToUpdate.likes + 1 }

        const response = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedData)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)

        const blogsAtEnd = await helper.blogsInDb()
        const updatedBlog = blogsAtEnd.find(b => b.id === blogToUpdate.id)
        assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1)
    })
})

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('expected `username` to be unique'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

describe('user creation', () => {
    beforeEach(async () => {
        await User.deleteMany({})
    })
    test('missing username rejected', async () => {
        const newUser = {
            name: 'User Missing',
            password: 'usermissing'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        assert(result.body.error.includes('username'))
    })
    test('missing password rejected', async () => {
        const newUser = {
            username: 'passwordmissing',
            name: 'Password Missing'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        assert(result.body.error.includes('password'))
    })
    test('user is created successfully', async () => {
        const newUser = {
            username: 'Mikkonen',
            name: 'Testi Mikko',
            password: 'mikko123'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)

        const users = await User.find({})
        assert.strictEqual(users.length, 1)
    })

    test('too short password rejected', async () => {
        const newUser = {
            username: 'mallimikko',
            name: 'Malli Mikko',
            password: 'm1'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        assert(result.body.error.includes('password'))
    })

    test('too short user rejected', async () => {
        const newUser = {
            username: 'mm',
            name: 'Mini Mikko',
            password: 'mikko1'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        assert(result.body.error.includes('username'))
    })

    test('duplicate username rejected', async () => {
        const user = {
            username: 'samaMikko',
            name: 'Mikko',
            password: 'samamikko1'
        }

        await api.post('/api/users').send(user)

        const result = await api
            .post('/api/users')
            .send(user)
            .expect(400)

        assert(result.body.error.includes('unique'))
    })
})

after(async () => {
    await mongoose.connection.close()
})