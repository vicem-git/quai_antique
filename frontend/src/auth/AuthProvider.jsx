import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import axios from 'axios';
import { API } from '../utils/ApiCall';

const TOKEN_KEY = 'auth_token'
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [role, setRole] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY)
        if (!token) {
            setLoading(false)
            return
        }

        // validate token and get user info
        API.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setIsAuthenticated(true)
            setUser(res.data)
            setRole(res.data.accessLevel)
        })
        .catch(err => {
            console.error('Auth restore error:', err)
            localStorage.removeItem(TOKEN_KEY)
            setIsAuthenticated(false)
            setRole(null)
            setUser(null)
        })
        .finally(() => setLoading(false))
    },[])

    const login = ({ token, user, role }) => {
        localStorage.setItem(TOKEN_KEY, token)
        
        setIsAuthenticated(true)
        setRole(role)
        setUser(user)
    }

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY)
        setIsAuthenticated(false)
        setRole(null)
        setUser(null)
    }

    const value = { isAuthenticated, role, user, loading, login, logout }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}