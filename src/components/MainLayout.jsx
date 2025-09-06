// src/layouts/MainLayout.jsx
import React from 'react'
import { Outlet, useLocation, Navigate } from 'react-router'
import { Header } from '../components/Header'

export const MainLayout = () => {
  const location = useLocation()

  if (location.pathname === '/dashboard') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
