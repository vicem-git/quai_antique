import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from "react-router-dom"
import useAuth from "../auth/useAuth"

const Header = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { isAuthenticated, role, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/", { replace: true })
  }

  return (
    <header className="w-full bg-ground-0 border-b border-primary-1">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          className="font-cormorant text-2xl text-primary-3"
        >
          Quai Antique
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md hover:bg-ground-1 transition"
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Dropdown menu */}
      {open && (
        <nav className="w-full bg-ground-0 border-t border-primary-1">
          <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-4">
            
            {/* Public */}
            <Link to="/menu" onClick={() => setOpen(false)}>Menu</Link>
            <Link to="/gallery" onClick={() => setOpen(false)}>Galerie</Link>

            {/* Auth */}
            {!isAuthenticated && (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Connexion</Link>
                <Link to="/register" onClick={() => setOpen(false)}>Inscription</Link>
              </>
            )}

            {/* User */}
            {isAuthenticated && role === "user" && (
              <>
                <Link to="/user/dashboard" onClick={() => setOpen(false)}>
                  Mon espace
                </Link>
                <Link to="/user/reservations" onClick={() => setOpen(false)}>
                  Mes réservations
                </Link>
              </>
            )}

            {/* Admin */}
            {isAuthenticated && role === "admin" && (
              <Link to="/admin/dashboard" onClick={() => setOpen(false)}>
                Admin
              </Link>
            )}

            {/* Logout */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-left text-accent-1 font-medium"
              >
                Déconnexion
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header
