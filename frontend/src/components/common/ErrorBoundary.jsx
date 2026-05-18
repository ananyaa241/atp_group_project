import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-slate-950 text-white px-6'>
          <div className='max-w-2xl text-center p-10 rounded-3xl bg-slate-900/90 shadow-2xl'>
            <h1 className='text-5xl font-black'>Something went wrong</h1>
            <p className='mt-6 text-slate-300'>
              Please refresh the page or come back later. If the problem persists,
              contact support.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
