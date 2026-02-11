import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import useAuth from "../auth/useAuth"

const API_URL = 'http://localhost:3000'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password })
            const { token, user, accessLevel } = res.data
            
            // update auth context
            login({ token, user, role: accessLevel })
            if (accessLevel === 'admin') {
                navigate('/admin/dashboard', { replace: true })
            } else {
                navigate('/user/dashboard', { replace: true })
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Échec de la connexion. Veuillez vérifier vos identifiants et réessayer.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <h2>Connexion</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Mot de passe:</label>
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                </button>
            </form>
        </div>
    )
}
