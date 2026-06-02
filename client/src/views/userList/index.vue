<template>
  <div class="user-list-page">
    <div class="page-header">
      <h2 class="page-title">用户列表</h2>
      <div class="header-actions">
        <button v-permission="'user:create'" class="btn btn-primary" @click="openCreate">创建用户</button>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>角色</th>
            <th>邮箱</th>
            <th>创建时间</th>
            <th>最后登录</th>
            <th v-if="canEdit">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>
              <span class="role-tag" :class="user.role">{{ user.role === 'admin' ? '管理员' : '访客' }}</span>
            </td>
            <td>{{ user.email || '-' }}</td>
            <td>{{ formatTime(user.created_at) }}</td>
            <td>{{ user.last_login ? formatTime(user.last_login) : '-' }}</td>
            <td v-if="canEdit" class="action-cell">
              <button v-permission="'user:edit'" class="btn btn-small" @click="openEdit(user)">编辑</button>
              <button v-permission="'user:delete'" class="btn btn-small btn-danger" @click="confirmDelete(user)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!userList.length" class="empty-state">暂无数据</div>
    </div>

    <div class="pagination">
      <span class="page-info">共 {{ total }} 条</span>
      <div class="page-btns">
        <button class="btn btn-small" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
        <span class="page-current">{{ page }} / {{ totalPages }}</span>
        <button class="btn btn-small" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
      </div>
    </div>

    <!-- 创建/编辑用户弹窗 -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑用户' : '创建用户' }}</h3>
          <button class="modal-close" @click="closeFormModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名 <span class="required">*</span></label>
            <input v-model="form.username" class="form-input" placeholder="请输入用户名" />
          </div>
          <div class="form-group">
            <label>密码 <span class="required" v-if="!isEditing">*</span><span v-else class="optional">(留空不修改)</span></label>
            <input v-model="form.password" type="password" class="form-input" :placeholder="isEditing ? '留空则不修改密码' : '请输入密码'" />
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="form.role" class="form-input">
              <option value="viewer">访客</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="form.email" class="form-input" placeholder="请输入邮箱" />
          </div>
          <div class="form-error" v-if="formError">{{ formError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="closeFormModal">取消</button>
          <button class="btn btn-primary" :disabled="submitting" @click="submitForm">{{ submitting ? '提交中...' : '确认' }}</button>
        </div>
      </div>
    </div>

    <!-- 确认删除弹窗 -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>确认删除</h3>
        </div>
        <div class="modal-body confirm-body">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="22" stroke="#ff6b6b" stroke-width="2" fill="none"/>
            <path d="M24 16v10M24 30v2" stroke="#ff6b6b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          </svg>
          <p>确定要删除用户 <strong>{{ deleteTarget?.username }}</strong> 吗？</p>
          <p class="confirm-hint">此操作不可撤销</p>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="cancelDelete">取消</button>
          <button class="btn btn-danger" :disabled="submitting" @click="submitDelete">{{ submitting ? '删除中...' : '确认删除' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import http from '@/utils/request'
import { usePermissionStore } from '@/stores/permissionStore'
import type { UserInfo } from '@/types/api'

const permissionStore = usePermissionStore()

const userList = ref<UserInfo[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const showFormModal = ref(false)
const showConfirmModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formError = ref('')
const form = ref({ username: '', password: '', role: 'viewer', email: '' })
const deleteTarget = ref<UserInfo | null>(null)

const canEdit = computed(() => {
  return permissionStore.hasAnyPermission(['user:edit', 'user:delete'])
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

async function fetchUsers() {
  try {
    const res = await http.get('/user/list', {
      params: { page: page.value, pageSize: pageSize.value }
    })
    const data = res.data.data
    userList.value = data.list
    total.value = data.total
  } catch (err) {
    console.error('Failed to fetch users:', err)
  }
}

function changePage(p: number) {
  page.value = p
  fetchUsers()
}

function openCreate() {
  isEditing.value = false
  editingId.value = null
  form.value = { username: '', password: '', role: 'viewer', email: '' }
  formError.value = ''
  showFormModal.value = true
}

function openEdit(user: UserInfo) {
  isEditing.value = true
  editingId.value = user.id
  form.value = { username: user.username, password: '', role: user.role, email: user.email || '' }
  formError.value = ''
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  formError.value = ''
}

async function submitForm() {
  formError.value = ''
  if (!form.value.username) {
    formError.value = '用户名不能为空'
    return
  }
  if (!isEditing.value && !form.value.password) {
    formError.value = '密码不能为空'
    return
  }

  submitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      const payload: any = { username: form.value.username, role: form.value.role, email: form.value.email }
      if (form.value.password) payload.password = form.value.password
      await http.put(`/user/${editingId.value}`, payload)
    } else {
      await http.post('/user', form.value)
    }
    closeFormModal()
    fetchUsers()
  } catch (err: any) {
    formError.value = err.response?.data?.message || err.message || '操作失败'
  } finally {
    submitting.value = false
  }
}

function confirmDelete(user: UserInfo) {
  deleteTarget.value = user
  showConfirmModal.value = true
}

function cancelDelete() {
  showConfirmModal.value = false
  deleteTarget.value = null
}

async function submitDelete() {
  if (!deleteTarget.value) return
  submitting.value = true
  try {
    await http.delete(`/user/${deleteTarget.value.id}`)
    showConfirmModal.value = false
    deleteTarget.value = null
    fetchUsers()
  } catch (err) {
    console.error('Failed to delete user:', err)
  } finally {
    submitting.value = false
  }
}

onMounted(fetchUsers)
</script>

<style lang="scss" scoped>
.user-list-page {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 1px;

  &::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 18px;
    background: var(--accent-cyan);
    margin-right: 10px;
    vertical-align: middle;
    border-radius: 2px;
  }
}

.table-container {
  flex: 1;
  overflow: auto;
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.6), rgba(10, 22, 40, 0.6));
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 12px 16px;
    text-align: left;
    font-size: 13px;
  }

  th {
    color: var(--text-secondary);
    font-weight: 500;
    border-bottom: 1px solid rgba(0, 240, 255, 0.1);
    background: rgba(0, 240, 255, 0.03);
  }

  td {
    color: var(--text-primary);
    border-bottom: 1px solid rgba(0, 240, 255, 0.04);
  }

  tr:hover td {
    background: rgba(0, 240, 255, 0.02);
  }
}

.role-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;

  &.admin {
    background: rgba(0, 240, 255, 0.1);
    color: var(--accent-cyan);
    border: 1px solid rgba(0, 240, 255, 0.3);
  }

  &.viewer {
    background: rgba(136, 153, 170, 0.1);
    color: var(--text-secondary);
    border: 1px solid rgba(136, 153, 170, 0.3);
  }
}

.action-cell {
  display: flex;
  gap: 6px;
}

.btn {
  padding: 6px 14px;
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.btn-primary {
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
    color: #0a1628;
    border: none;
    font-weight: 600;

    &:hover {
      box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
    }
  }

  &.btn-danger {
    background: linear-gradient(135deg, var(--accent-red), #e04848);
    color: #fff;
    border: none;
    font-weight: 600;

    &:hover {
      box-shadow: 0 0 12px rgba(255, 107, 107, 0.3);
      border-color: var(--accent-red);
    }

    &:not(.btn-danger) {
      background: transparent;
      border: 1px solid rgba(255, 107, 107, 0.3);
      color: var(--accent-red);
    }
  }

  &.btn-small {
    padding: 4px 10px;
    font-size: 12px;
  }
}

.required {
  color: var(--accent-red);
}

.optional {
  color: var(--text-secondary);
  font-weight: normal;
  font-size: 11px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-top: 12px;
}

.page-info {
  font-size: 13px;
  color: var(--text-secondary);
}

.page-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-current {
  font-size: 13px;
  color: var(--text-primary);
  min-width: 60px;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 420px;
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.98), rgba(10, 22, 40, 0.98));
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.modal-sm {
  width: 360px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.08);

  h3 {
    font-size: 16px;
    color: var(--text-primary);
  }
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: var(--accent-cyan);
  }
}

.modal-body {
  padding: 20px;
}

.confirm-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 20px;
  text-align: center;

  p {
    font-size: 14px;
    color: var(--text-primary);
    margin: 0;
  }

  .confirm-hint {
    font-size: 12px;
    color: var(--text-secondary);
    opacity: 0.7;
  }
}

.form-group {
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }
}

.form-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  background: rgba(10, 22, 40, 0.8);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 6px rgba(0, 240, 255, 0.15);
  }
}

select.form-input {
  cursor: pointer;
}

.form-error {
  color: var(--accent-red);
  font-size: 13px;
  margin-top: 8px;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid rgba(0, 240, 255, 0.08);
}
</style>
