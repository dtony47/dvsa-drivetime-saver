import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/AuthForm'

export default function Register() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async ({ email, password, role }) => {
    setError('')
    setLoading(true)
    try {
      const user = await register(email, password, role)
      if (user.role === 'instructor') {
        navigate('/instructor/dashboard')
      } else {
        navigate('/learner/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <AuthForm mode="register" onSubmit={handleSubmit} error={error} loading={loading} />
}
