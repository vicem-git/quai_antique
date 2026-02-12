import './App.css'
import { Routes, Route } from 'react-router-dom'
import Header from "./components/Header"
import Footer from "./components/Footer"

// public pages
import Home from './pages/Home'
import Menu from './pages/Menu'
import Gallery from './pages/Gallery'

// auth pages
import Login from './pages/Login'
import Register from './pages/Register'

// ui protect
import ProtectedLayout from './auth/ProtectedLayout'

// user pages
import UserDashboard from './pages/user/UserDashboard'
import UserReservations from './pages/user/Reservations'

// admin pages
import AdminDashboard from './pages/admin/AdminDashboard'


 
function App() {

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-[70%] py-8 px-4">
          <Routes>
            {/* public routes */}
            <Route path='/' element={<Home />} />
            <Route path='/menu' element={<Menu />} />
            <Route path='/gallery' element={<Gallery />} />

            {/* auth routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* user routes */}
            <Route element={<ProtectedLayout allowedRoles={['user']} />}>
                <Route path='/user/dashboard' element={<UserDashboard />} />
                <Route path='/user/reservations' element={<UserReservations />} />
            </Route>

            {/* admin routes */}
            <Route element={<ProtectedLayout allowedRoles={['admin']} />}>
                <Route path='/admin/dashboard' element={<AdminDashboard />} />
            </Route>
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
