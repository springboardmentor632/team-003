import React from 'react'
import Logo from '../components/Logo'

export default function Landing({ onNavigate }: { onNavigate: (s: any) => void }) {
  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Logo size={96} />
          <h2 className="text-3xl font-extrabold text-gray-900">DecisionHub</h2>
          <p className="text-gray-600 max-w-xl">
            DecisionHub helps teams capture, compare and decide together. Create decisions, collect options, and track outcomes — all in one place.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button onClick={() => onNavigate('signup')} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">Get Started</button>
          <button onClick={() => onNavigate('login')} className="px-6 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Sign In</button>
        </div>

        <div className="text-sm text-gray-500">
          <strong>Note:</strong> This demo runs a local mock backend when you start the project. Your data is stored in-memory.
        </div>
      </div>
    </div>
  )
}
