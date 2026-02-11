import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { API } from "../utils/ApiCall";

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await API.post('/auth/register', { email, password, firstName, lastName });
            const { token, user } = res.data;
            
            // update auth context
            login({ token, user, role: 'user' });
            navigate('/user/dashboard', { replace: true });
        } catch (err) {
            console.error('Registration error:', err);
            setError('Échec de l\'inscription. Veuillez vérifier vos informations et réessayer.');
        } finally {
            setLoading(false);
        }
    }

    return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md bg-ground0 p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-cormorant font-semibold text-primary3 mb-6 text-center">
          Inscription
        </h2>

        {error && (
          <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-primary2">Prénom:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-primary1 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-primary2">Nom:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-primary1 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-primary2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-primary1 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-primary2">Mot de passe:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-primary1 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-ground0 font-semibold py-2 rounded-lg transition disabled:opacity-70"
          >
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  )
}