const express = require('express')
const router = express.Router()
const pool = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, platform } = req.body
    if(!name || !phone || !password) return res.status(400).json({error:'Missing required fields'})

    // check duplicates by email or phone
    const [exists] = await pool.query('SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1', [email || '', phone])
    if(exists.length) return res.status(400).json({error:'User with given email or phone already exists'})

    const hashed = await bcrypt.hash(password, 10)
    const [result] = await pool.query('INSERT INTO users (name, email, phone, password, platform) VALUES (?, ?, ?, ?, ?)', [name, email || null, phone, hashed, platform || null])

    const userId = result.insertId
    const token = jwt.sign({id: userId}, JWT_SECRET, {expiresIn: '7d'})
    res.json({id: userId, token})
  } catch (err) {
    console.error(err)
    res.status(500).json({error: 'Server error'})
  }
})

// Login user (by email or phone)
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body // identifier = email or phone
    if(!identifier || !password) return res.status(400).json({error:'Missing credentials'})

    const [rows] = await pool.query('SELECT id, name, email, phone, password, platform FROM users WHERE email = ? OR phone = ? LIMIT 1', [identifier, identifier])
    if(!rows.length) return res.status(401).json({error:'Invalid credentials'})

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if(!match) return res.status(401).json({error:'Invalid credentials'})

    const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '7d'})
    res.json({id: user.id, name: user.name, email: user.email, phone: user.phone, platform: user.platform, token})
  } catch (err) {
    console.error(err)
    res.status(500).json({error:'Server error'})
  }
})

module.exports = router
