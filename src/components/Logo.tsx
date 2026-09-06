import React from 'react'

export default function Logo({ size = 56 }: { size?: number }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="#4F46E5" />
      <path d="M20 36c4-6 12-10 20-10v6c-6 0-11 2-14 6-3 4-6 2-6-2z" fill="#C7B8FF" opacity="0.95" />
      <text x="50%" y="56%" textAnchor="middle" fill="white" fontSize="20" fontWeight="700" fontFamily="Inter, sans-serif">D</text>
    </svg>
  )
}
