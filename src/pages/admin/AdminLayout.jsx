// src/pages/admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import {
    FiMenu,
    FiX,
    FiChevronLeft,
    FiChevronRight,
    FiBox,
} from 'react-icons/fi'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function AdminLayout() {
    // baca initial collapsed dari localStorage (server-safe)
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem('mn_sidebar_collapsed') === '1'
    })

    const [drawerOpen, setDrawerOpen] = useState(false)
    const navigate = useNavigate()

    // simpan perubahan collapsed ke localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('mn_sidebar_collapsed', collapsed ? '1' : '0')
        }
    }, [collapsed])

    // LOGOUT: hapus token/user lalu redirect ke HOME ('/') dengan replace
    function handleLogout() {
        try {
            localStorage.removeItem('mn_token')
            localStorage.removeItem('mn_user')
            sessionStorage.removeItem('mn_token')
            sessionStorage.removeItem('mn_user')
            // jika ada cookie/session server, panggil API logout di sini sebelum redirect
        } catch (e) {
            // ignore
        }

        // navigasi ke beranda dan replace history supaya tidak kembali ke admin
        navigate('/', { replace: true })
    }

    // margin class for content area (shift when sidebar present)
    const mdMarginClass = collapsed ? 'md:ml-20' : 'md:ml-64'

    return (
        <div className='min-h-screen'>
            {/* Desktop fixed sidebar */}
            <div
                className={`hidden md:block fixed top-0 left-0 bottom-0 z-40 ${
                    collapsed ? 'w-20' : 'w-64'
                }`}
            >
                <Sidebar
                    collapsed={collapsed}
                    mobile={false}
                    onClose={() => {}}
                    onLogout={handleLogout}
                    orderCount={12}
                />

                <button
                    onClick={() => setCollapsed((s) => !s)}
                    className='fixed top-4 z-50 right-[5px] bg-white rounded-full p-1 shadow hover:shadow-md'
                    aria-label='Toggle sidebar'
                >
                    {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>

            {/* Mobile topbar */}
            <header className='md:hidden fixed inset-x-0 top-0 z-40 bg-white border-b'>
                <div className='flex items-center justify-between px-3 py-2'>
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className='p-2 rounded-md hover:bg-gray-100'
                            aria-label='Open menu'
                        >
                            <FiMenu />
                        </button>
                        <div className='flex items-center gap-2'>
                            <div className='bg-slate-900 text-white rounded-md p-2'>
                                <FiBox />
                            </div>
                            <div>
                                <div className='text-sm font-semibold'>
                                    MN Konveksi
                                </div>
                                <div className='text-xs text-gray-500'>
                                    Admin Panel
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className='p-2 rounded-md hover:bg-gray-100'
                        title='Logout'
                        aria-label='Logout'
                    >
                        <FiX />
                    </button>
                </div>
            </header>

            {/* Mobile drawer */}
            {drawerOpen && (
                <div className='fixed inset-0 z-50 md:hidden'>
                    <div
                        className='absolute inset-0 bg-black/40'
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className='absolute left-0 top-0 bottom-0 w-72 z-50'>
                        <Sidebar
                            collapsed={false}
                            mobile={true}
                            onClose={() => setDrawerOpen(false)}
                            onLogout={handleLogout}
                            orderCount={12}
                        />
                    </div>
                </div>
            )}

            {/* spacer for mobile topbar */}
            <div className='md:hidden h-16' />

            {/* main content */}
            <div
                className={`${mdMarginClass} transition-all duration-200 min-h-screen bg-slate-50`}
            >
                <main className='p-6 md:p-8'>
                    <Outlet />
                </main>
            </div>

            {/* 🔔 TOAST (GLOBAL ADMIN) */}
            <ToastContainer
                position='top-right'
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme='light'
            />
        </div>
    )
}
