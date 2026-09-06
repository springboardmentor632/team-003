import api from './api'

export interface CreateDecisionRequest {
  title: string
  description?: string
  category?: string | null
  visibility?: 'public' | 'private'
  votingType?: string
  options: string[]
  deadline?: string | null
}

export async function createDecision(req: CreateDecisionRequest) {
  const res = await api.post('/decisions', req)
  return res.data
}

export async function getDecision(id: string) {
  const res = await api.get(`/decisions/${id}`)
  return res.data
}

export async function listDecisions() {
  const res = await api.get('/decisions')
  return res.data
}

export async function voteOnDecision(id: string, optionId: string) {
  await api.post(`/decisions/${id}/votes`, { optionId })
}

export async function listComments(id: string) {
  const res = await api.get(`/decisions/${id}/comments`)
  return res.data
}

export async function addComment(id: string, content: string) {
  const res = await api.post(`/decisions/${id}/comments`, { content })
  return res.data
}
