import type { Response } from 'express'
import bcrypt from 'bcryptjs'
import type { ResultSetHeader } from 'mysql2'
import type { AuthRequest } from '../middleware/auth.js'
import { pool } from '../services/dataService.js'
import type { ApiResponse, UserInfo } from '../types/index.js'

export async function getUserList(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10
    const offset = (page - 1) * pageSize

    const [countRows] = await pool.query<any[]>('SELECT COUNT(*) AS total FROM users')
    const total = countRows[0].total

    const [rows] = await pool.query<any[]>(
      'SELECT id, username, role, email, created_at, last_login FROM users ORDER BY id ASC LIMIT ? OFFSET ?',
      [pageSize, offset]
    )

    const response: ApiResponse<{ list: UserInfo[]; total: number; page: number; pageSize: number }> = {
      code: 0,
      data: { list: rows as UserInfo[], total, page, pageSize },
      message: 'success'
    }
    res.json(response)
  } catch (err) {
    console.error('[User] getUserList error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function createUser(req: AuthRequest, res: Response) {
  try {
    const { username, password, role, email } = req.body
    if (!username || !password) {
      return res.status(400).json({ code: -1, data: null, message: '用户名和密码不能为空' })
    }
    const password_hash = await bcrypt.hash(password, 10)
    await pool.execute(
      'INSERT INTO users (username, password_hash, role, email) VALUES (?, ?, ?, ?)',
      [username, password_hash, role || 'viewer', email || null]
    )
    res.json({ code: 0, data: null, message: '创建成功' })
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: -1, data: null, message: '用户名已存在' })
    }
    console.error('[User] createUser error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id)
    const { username, role, email, password } = req.body
    if (!username) {
      return res.status(400).json({ code: -1, data: null, message: '用户名不能为空' })
    }
    if (password) {
      const password_hash = await bcrypt.hash(password, 10)
      await pool.execute(
        'UPDATE users SET username = ?, role = ?, email = ?, password_hash = ? WHERE id = ?',
        [username, role || 'viewer', email || null, password_hash, id]
      )
    } else {
      await pool.execute(
        'UPDATE users SET username = ?, role = ?, email = ? WHERE id = ?',
        [username, role || 'viewer', email || null, id]
      )
    }
    res.json({ code: 0, data: null, message: '更新成功' })
  } catch (err) {
    console.error('[User] updateUser error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id)
    if (id === req.user!.id) {
      return res.status(400).json({ code: -1, data: null, message: '不能删除自己' })
    }

    const [orders] = await pool.execute<any[]>('SELECT COUNT(*) AS cnt FROM orders WHERE user_id = ?', [id])
    const [logs] = await pool.execute<any[]>('SELECT COUNT(*) AS cnt FROM access_logs WHERE user_id = ?', [id])

    if (orders[0].cnt > 0) {
      await pool.execute('DELETE FROM orders WHERE user_id = ?', [id])
    }
    if (logs[0].cnt > 0) {
      await pool.execute('DELETE FROM access_logs WHERE user_id = ?', [id])
    }

    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: -1, data: null, message: '用户不存在' })
    }

    res.json({ code: 0, data: null, message: `删除成功，已同时清理 ${orders[0].cnt} 条订单、${logs[0].cnt} 条日志` })
  } catch (err: any) {
    console.error('[User] deleteUser error:', err?.sqlMessage || err?.message || err)
    res.status(500).json({ code: -1, data: null, message: '删除失败，请稍后重试' })
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const [rows] = await pool.execute<any[]>(
      'SELECT id, username, role, email, created_at, last_login FROM users WHERE id = ?',
      [req.user!.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ code: -1, data: null, message: '用户不存在' })
    }
    const response: ApiResponse<UserInfo> = { code: 0, data: rows[0], message: 'success' }
    res.json(response)
  } catch (err) {
    console.error('[User] getProfile error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}
