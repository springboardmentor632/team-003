import api from './api'

export async function listNotifications() {
  const res = await api.get('/notifications')
  return res.data
}

export async function markNotificationRead(id: number) {
  await api.put(`/notifications/${id}/read`)
}