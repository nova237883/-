<template>
  <div class="data-list-page">
    <div class="page-header">
      <h2 class="page-title">数据列表</h2>
      <div class="header-actions">
        <button v-permission="'data:export'" class="btn btn-primary" @click="openCreate">创建订单</button>
        <button v-permission="'data:export'" class="btn" @click="exportData">导出CSV</button>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>用户ID</th>
            <th>金额</th>
            <th>状态</th>
            <th>地区</th>
            <th>品类</th>
            <th>时间</th>
            <th v-if="canEdit">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orderList" :key="order.id">
            <td class="mono">{{ order.order_no }}</td>
            <td>{{ order.user_id }}</td>
            <td class="mono">¥{{ Number(order.amount).toLocaleString() }}</td>
            <td>
              <span class="status-tag" :class="order.status">{{ statusLabel(order.status) }}</span>
            </td>
            <td>{{ order.region }}</td>
            <td>{{ order.category }}</td>
            <td class="mono">{{ formatTime(order.created_at) }}</td>
            <td v-if="canEdit" class="action-cell">
              <button class="btn btn-small" @click="openEdit(order)">编辑</button>
              <button class="btn btn-small btn-danger-text" @click="confirmDelete(order)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!orderList.length" class="empty-state">暂无数据</div>
    </div>

    <div class="pagination">
      <span class="page-info">共 {{ total }} 条</span>
      <div class="page-btns">
        <button class="btn btn-small" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
        <span class="page-current">{{ page }} / {{ totalPages }}</span>
        <button class="btn btn-small" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
      </div>
    </div>

    <!-- 创建/编辑订单弹窗 -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑订单' : '创建订单' }}</h3>
          <button class="modal-close" @click="closeFormModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>订单号 <span class="required">*</span></label>
            <input v-model="form.order_no" class="form-input" placeholder="ORD2025010100001" :disabled="isEditing" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>用户ID <span class="required">*</span></label>
              <input v-model.number="form.user_id" type="number" class="form-input" placeholder="1" />
            </div>
            <div class="form-group">
              <label>金额 <span class="required">*</span></label>
              <input v-model.number="form.amount" type="number" step="0.01" class="form-input" placeholder="0.00" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>状态</label>
              <select v-model="form.status" class="form-input">
                <option value="pending">处理中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
            <div class="form-group">
              <label>地区 <span class="required">*</span></label>
              <select v-model="form.region" class="form-input">
                <option value="">请选择</option>
                <option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>品类 <span class="required">*</span></label>
            <select v-model="form.category" class="form-input">
              <option value="">请选择</option>
              <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
            </select>
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
          <p>确定要删除订单 <strong>{{ deleteTarget?.order_no }}</strong> 吗？</p>
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

interface OrderItem {
  id: number
  order_no: string
  user_id: number
  amount: string
  status: string
  region: string
  category: string
  created_at: string
}

const permissionStore = usePermissionStore()

const orderList = ref<OrderItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(15)

const showFormModal = ref(false)
const showConfirmModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formError = ref('')
const deleteTarget = ref<OrderItem | null>(null)

const form = ref({
  order_no: '', user_id: 1, amount: 0, status: 'pending', region: '', category: ''
})

const regionOptions = [
  '北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京',
  '重庆', '苏州', '天津', '长沙', '西安', '郑州', '东莞', '青岛',
  '沈阳', '宁波', '昆明', '大连'
]

const categoryOptions = [
  '电子产品', '服装鞋帽', '食品饮料', '家居用品', '美妆个护', '图书文具'
]

const canEdit = computed(() => {
  return permissionStore.hasAnyPermission(['data:export'])
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

function statusLabel(status: string) {
  const map: Record<string, string> = {
    completed: '已完成',
    pending: '处理中',
    cancelled: '已取消'
  }
  return map[status] || status
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

async function fetchOrders() {
  try {
    const res = await http.get('/dashboard/orders', {
      params: { page: page.value, pageSize: pageSize.value }
    })
    const data = res.data.data
    orderList.value = data.list
    total.value = data.total
  } catch (err) {
    console.error('Failed to fetch orders:', err)
  }
}

function changePage(p: number) {
  page.value = p
  fetchOrders()
}

function exportData() {
  let csv = '订单号,用户ID,金额,状态,地区,品类,时间\n'
  for (const order of orderList.value) {
    csv += `${order.order_no},${order.user_id},${order.amount},${order.status},${order.region},${order.category},${order.created_at}\n`
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `订单数据_${new Date().toLocaleDateString()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function openCreate() {
  isEditing.value = false
  editingId.value = null
  form.value = { order_no: '', user_id: 1, amount: 0, status: 'pending', region: '', category: '' }
  formError.value = ''
  showFormModal.value = true
}

function openEdit(order: OrderItem) {
  isEditing.value = true
  editingId.value = order.id
  form.value = {
    order_no: order.order_no,
    user_id: order.user_id,
    amount: Number(order.amount),
    status: order.status,
    region: order.region,
    category: order.category
  }
  formError.value = ''
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  formError.value = ''
}

async function submitForm() {
  formError.value = ''

  if (!isEditing.value && !form.value.order_no) {
    formError.value = '订单号不能为空'
    return
  }
  if (!form.value.user_id || !form.value.amount) {
    formError.value = '用户ID和金额不能为空'
    return
  }
  if (!form.value.region || !form.value.category) {
    formError.value = '地区和品类不能为空'
    return
  }

  submitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      await http.put(`/dashboard/orders/${editingId.value}`, {
        amount: form.value.amount,
        status: form.value.status,
        region: form.value.region,
        category: form.value.category
      })
    } else {
      await http.post('/dashboard/orders', {
        order_no: form.value.order_no,
        user_id: form.value.user_id,
        amount: form.value.amount,
        status: form.value.status,
        region: form.value.region,
        category: form.value.category
      })
    }
    closeFormModal()
    fetchOrders()
  } catch (err: any) {
    formError.value = err.response?.data?.message || err.message || '操作失败'
  } finally {
    submitting.value = false
  }
}

function confirmDelete(order: OrderItem) {
  deleteTarget.value = order
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
    await http.delete(`/dashboard/orders/${deleteTarget.value.id}`)
    showConfirmModal.value = false
    deleteTarget.value = null
    fetchOrders()
  } catch (err) {
    console.error('Failed to delete order:', err)
  } finally {
    submitting.value = false
  }
}

onMounted(fetchOrders)
</script>

<style lang="scss" scoped>
.data-list-page {
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
    background: var(--accent-purple);
    margin-right: 10px;
    vertical-align: middle;
    border-radius: 2px;
  }
}

.header-actions {
  display: flex;
  gap: 8px;
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
    padding: 10px 14px;
    text-align: left;
    font-size: 13px;
    white-space: nowrap;
  }

  th {
    color: var(--text-secondary);
    font-weight: 500;
    border-bottom: 1px solid rgba(0, 240, 255, 0.1);
    background: rgba(0, 240, 255, 0.03);
    position: sticky;
    top: 0;
  }

  td {
    color: var(--text-primary);
    border-bottom: 1px solid rgba(0, 240, 255, 0.04);
  }

  tr:hover td {
    background: rgba(0, 240, 255, 0.02);
  }
}

.mono {
  font-family: var(--font-number);
  font-size: 12px;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;

  &.completed {
    background: rgba(0, 214, 143, 0.1);
    color: var(--accent-green);
    border: 1px solid rgba(0, 214, 143, 0.3);
  }
  &.pending {
    background: rgba(255, 159, 67, 0.1);
    color: var(--accent-orange);
    border: 1px solid rgba(255, 159, 67, 0.3);
  }
  &.cancelled {
    background: rgba(255, 107, 107, 0.1);
    color: var(--accent-red);
    border: 1px solid rgba(255, 107, 107, 0.3);
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
    }
  }

  &.btn-small {
    padding: 4px 10px;
    font-size: 12px;
  }
}

.btn-danger-text {
  border-color: rgba(255, 107, 107, 0.3);
  color: var(--accent-red);

  &:hover {
    border-color: var(--accent-red) !important;
    color: var(--accent-red) !important;
    background: rgba(255, 107, 107, 0.05);
  }
}

.required {
  color: var(--accent-red);
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
  width: 460px;
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
  flex: 1;

  label {
    display: block;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }
}

.form-row {
  display: flex;
  gap: 12px;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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