import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/AuthForm'

export default function Login() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async ({ email, password }) => {
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'instructor') {
        navigate('/instructor/dashboard')
      } else {
        navigate('/learner/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return <AuthForm mode="login" onSubmit={handleSubmit} error={error} loading={loading} />
}
