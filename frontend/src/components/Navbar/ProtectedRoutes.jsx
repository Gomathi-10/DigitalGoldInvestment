import { Outlet, Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = () => {
    const token = localStorage.getItem('token')
    const hasAcceptedTC = localStorage.getItem('has_accepted_tc') === 'true'
    const isStaff = localStorage.getItem('is_staff') === 'true'
    const location = useLocation()

    if (!token) {
        return <Navigate to="/login" />
    }

    // If logged in but hasn't accepted T&C, redirect to T&C page
    // Staff members can bypass this if desired, or you can enforce it for everyone
    if (!hasAcceptedTC && !isStaff && location.pathname !== '/terms-and-conditions') {
        return <Navigate to="/terms-and-conditions" />
    }

    return <Outlet />
}

export default ProtectedRoute