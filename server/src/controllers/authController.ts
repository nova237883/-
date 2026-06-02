import type { Response } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../services/dataService.js'
import { generateToken } from '../middleware/auth.js'
import type { AuthRequest } from '../middleware/auth.js'
import type { ApiResponse } from '../types/index.js'

interface UserRow {
  id: number
  username: string
  password_hash: string
  role: string
  email: string | null
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      const response: ApiResponse<null> = { code: -1, data: null, message: '用户名和密码不能为空' }
      return res.status(400).json(response)
    }

    const [rows] = await pool.execute<any[]>(
      'SELECT id, username, password_hash, role, email FROM users WHERE username = ?',
      [username]
    )

    if (rows.length === 0) {
      const response: ApiResponse<null> = { code: -1, data: null, message: '用户名或密码错误' }
      return res.status(401).json(response)
    }

    const user: UserRow = rows[0]
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      const response: ApiResponse<null> = { code: -1, data: null, message: '用户名或密码错误' }
      return res.status(401).json(response)
    }

    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id])

    const token = generateToken({ id: user.id, username: user.username, role: user.role })

    const response: ApiResponse<{ token: string; user: { id: number; username: string; role: string } }> = {
      code: 0,
      data: { token, user: { id: user.id, username: user.username, role: user.role } },
      message: '登录成功'
    }
    res.json(response)
  } catch (err) {
    console.error('[Auth] login error:', err)
    const response: ApiResponse<null> = { code: -1, data: null, message: '服务器内部错误' }
    res.status(500).json(response)
  }
}

export async function profile(req: AuthRequest, res: Response) {
  try {
    const [rows] = await pool.execute<any[]>(
      'SELECT id, username, role, email, created_at, last_login FROM users WHERE id = ?',
      [req.user!.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ code: -1, data: null, message: '用户不存在' })
    }
    const response: ApiResponse<typeof rows[0]> = { code: 0, data: rows[0], message: 'success' }
    res.json(response)
  } catch (err) {
    console.error('[Auth] profile error:', err)
    res.status(500).json({ code: -1, data: null, message: '服务器内部错误' })
  }
}
