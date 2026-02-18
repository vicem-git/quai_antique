import { Navigate, Outlet } from "react-router-dom";
import useAuth from "./useAuth";

export default function ProtectedLayout({ allowedRoles }) {
    const { isAuthenticated, role, loading } = useAuth()

    if (loading) {
        return <Navigate to='/login' replace />
    }

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to='/login' replace />
    }

    return <Outlet />
}


