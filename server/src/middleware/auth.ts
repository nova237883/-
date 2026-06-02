import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string }
}

const SECRET = process.env.JWT_SECRET || 'dashboard_secret_key_2025'

export function generateToken(payload: { id: number; username: string; role: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' })
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ code: -1, data: null, message: '未授权，请登录' })
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, SECRET) as any
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role }
    next()
  } catch {
    return res.status(401).json({ code: -1, data: null, message: 'token 无效或已过期' })
  }
}
