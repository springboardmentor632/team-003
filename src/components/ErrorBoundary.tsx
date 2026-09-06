import React from 'react'

type Props = {
  children?: React.ReactNode
  onReset?: () => void
}

type State = { hasError: boolean; error?: any }

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any, info: any) {
    // log to console for now
    console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-3xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Something went wrong</h3>
          <p className="text-sm text-gray-600 mb-4">An unexpected error occurred while rendering this page.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => { this.setState({ hasError: false }); this.props.onReset?.() }} className="px-4 py-2 rounded-lg border border-gray-200">Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
