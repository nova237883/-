import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { pool } from '../services/dataService.js'
import type { ApiResponse, MenuItem } from '../types/index.js'

function buildMenuTree(items: MenuItem[]): MenuItem[] {
  const map = new Map<number, MenuItem>()
  const roots: MenuItem[] = []

  for (const item of items) {
    map.set(item.id, { ...item, children: [] })
  }

  for (const item of map.values()) {
    if (item.parent_id === 0) {
      roots.push(item)
    } else {
      const parent = map.get(item.parent_id)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(item)
      }
    }
  }

  return roots.sort((a, b) => a.sort_order - b.sort_order)
}

export async function getMenus(req: AuthRequest, res: Response) {
  try {
    const role = req.user!.role
    const [rows] = await pool.execute<any[]>(
      `SELECT m.* FROM menus m
       INNER JOIN role_menus rm ON m.id = rm.menu_id
       WHERE rm.role = ? AND m.status = 1 AND m.type = 'menu'
       ORDER BY m.sort_order ASC`,
      [role]
    )
    const menus = buildMenuTree(rows as MenuItem[])
    const response: ApiResponse<MenuItem[]> = { code: 0, data: menus, message: 'success' }
    res.json(response)
  } catch (err) {
    console.error('[Permission] getMenus error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function getPermissions(req: AuthRequest, res: Response) {
  try {
    const role = req.user!.role
    const [rows] = await pool.execute<any[]>(
      `SELECT rp.permission_code FROM role_permissions rp WHERE rp.role = ?`,
      [role]
    )
    const codes = rows.map((r: any) => r.permission_code)
    const response: ApiResponse<string[]> = { code: 0, data: codes, message: 'success' }
    res.json(response)
  } catch (err) {
    console.error('[Permission] getPermissions error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}

export async function getAllMenus(_req: AuthRequest, res: Response) {
  try {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM menus WHERE status = 1 ORDER BY sort_order ASC`
    )
    const menus = buildMenuTree(rows as MenuItem[])
    const response: ApiResponse<MenuItem[]> = { code: 0, data: menus, message: 'success' }
    res.json(response)
  } catch (err) {
    console.error('[Permission] getAllMenus error:', err)
    res.status(500).json({ code: -1, data: null, message: 'Internal Server Error' })
  }
}
