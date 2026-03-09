const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const authRoutes = require('./routes/auth')

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res)=> res.json({ok:true, env: process.env.NODE_ENV || 'development'}))

const port = process.env.PORT || 4000
app.listen(port, ()=> console.log(`Backend listening on ${port}`))
