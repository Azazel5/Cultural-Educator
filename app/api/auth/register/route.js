
// ==============================================
// app/api/auth/register.js

import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request) {
  try {
    const { email, username, password } = await request.json()

    await dbConnect()

    // Validation
    if (!email || !username || !password) {
      return Response.json(
        { message: 'All fields are required' },
        { status: 400 })
    }

    if (password.length < 6) {
      return Response.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 })
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return Response.json(
        { message: existingUser.email === email ? 'Email already exists' : 'Username already exists' },
        { status: 400 })
    }

    // Create user
    const user = new User({ email, username, password })
    await user.save()

    return Response.json(
      { message: 'User created successfully' },
      { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 })
  }
}