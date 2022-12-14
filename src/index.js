const express = require('express')
const app = express();
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const usersRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const postRouter = require('./routes/posts')

dotenv.config();

mongoose.connect(process.env.MONGODB_URL, () => {
    console.log("Connected to MongoDB")
});

// middleware
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

app.get("/", (req, res) => {
    res.send("Homepage")
})

app.use("/api/users", usersRouter)
app.use("/api/auth", authRouter)
app.use("/api/posts", postRouter)

app.listen(1810, () => {
    console.log("Server is running!")
})