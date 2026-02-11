import { Link, NavLink, useNavigate } from "react-router-dom"
import useAuth from "../auth/useAuth"

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, role, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/", { replace: true })
  }

  const linkClass = ({ isActive }) =>
    `transition ${
      isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
    }`

  return (
    <header className="bg-ground0 border-b border-primary3/30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo / Brand */}
        <Link
          to="/"
          className="font-cormorant text-2xl font-semibold text-primary3"
        >
          Quai Antique
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm text-primary3">
          <NavLink to="/" className={linkClass}>
            Accueil
          </NavLink>
          <NavLink to="/menu" className={linkClass}>
            Menu
          </NavLink>
          <NavLink to="/gallery" className={linkClass}>
            Galerie
          </NavLink>

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={linkClass}>
                Connexion
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Inscription
              </NavLink>
            </>
          )}

          {isAuthenticated && role === "user" && (
            <NavLink to="/user/dashboard" className={linkClass}>
              Mon espace
            </NavLink>
          )}

          {isAuthenticated && role === "admin" && (
            <NavLink to="/admin/dashboard" className={linkClass}>
              Admin
            </NavLink>
          )}

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="ml-4 rounded border border-primary3 px-3 py-1 text-xs hover:bg-primary3 hover:text-ground0 transition"
            >
              Déconnexion
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
