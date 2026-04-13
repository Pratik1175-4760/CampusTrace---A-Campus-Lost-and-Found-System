import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export const formatDate = (date) => {
  const d = new Date(date)
  if (isToday(d))     return `Today, ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`
  return format(d, 'dd MMM yyyy, h:mm a')
}

export const formatDateShort = (date) => format(new Date(date), 'dd MMM yyyy')

export const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true })

export const formatLocationLabel = (location) => {
  if (!location) return '—'
  const { area, block, classroomName, seminarHall } = location
  if (area === 'Classroom') {
    const parts = [area]
    if (block)         parts.push(`Block ${block}`)
    if (classroomName) parts.push(classroomName)
    return parts.join(' › ')
  }
  if (area === 'Seminar Hall' && seminarHall) return `${seminarHall} Seminar Hall`
  return area || '—'
}

export const imageToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export const getMimeType = (file) => file.type || 'image/jpeg'

export const truncate = (str, n = 80) =>
  str?.length > n ? str.slice(0, n) + '…' : str
