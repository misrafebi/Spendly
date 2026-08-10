const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
const userRouter = require('./routes/userRouter')
const env = require('dotenv').config()
const db = require('./config/db')
db()

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 72 * 60 * 60 * 1000,
        secure: false,
        httpOnly: true
    }
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs')
app.set('views', [path.join(__dirname, 'views/users'), path.join(__dirname, 'views/admin')])

app.use(express.static(path.join(__dirname, 'public')))

app.use('/user', userRouter)

app.listen(process.env.PORT, () => {
    console.log('Server running....');
})

module.exports = app