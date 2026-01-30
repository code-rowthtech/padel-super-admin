import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminTopbar from "../../pages/admin/header/AdminTopbar";
import AdminSidebar from "../../pages/admin/sidebar/AdminSidebar";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { pathname } = useLocation();

    const getPageName = (path) => {
        const pageMap = {
            '/admin/dashboard': 'Dashboard',
            '/admin/profile': 'My Profile',
            '/admin/my-club': 'My Club',
            '/admin/booking': 'Bookings',
            '/admin/manualbooking': 'Manual Booking',
            '/admin/cancellation': 'Cancellation',
            '/admin/court-availability': 'Court Availability',
            '/admin/open-matches': 'Open Matches',
            '/admin/create-match': 'Create Match',
            '/admin/americano': 'Americano',
            '/admin/packages': 'Packages',
            '/admin/package-details': 'Package Details',
            '/admin/users': 'Users',
            '/admin/payments': 'Payment',
            '/admin/customer-reviews': 'Review & Rating',
            '/admin/help-support': 'Help & Support',
            '/admin/privacy': 'Privacy'
        };

        if (path.startsWith('/admin/match-details/')) {
            return 'View Match';
        }
        if (path.startsWith('/admin/manual-booking')) {
            return 'Manual Booking';
        }
        return pageMap[path] || '';
    };

    useEffect(() => {
        if (pathname === "/admin/login" || pathname === "/admin/sign-up") {
            localStorage.removeItem("clubFormData");
            sessionStorage.removeItem("registerId");
        } else if (pathname === "/admin/dashboard") {
            localStorage.removeItem("clubFormData");
        }

        if (!pathname.includes('/admin/manualbooking')) {
            sessionStorage.removeItem('manual-booking-slots');
        }
    }, [pathname]);

    return (
        <>
            <style>{`
                .admin-layout {
                    display: flex;
                    height: 100vh;
                    overflow: hidden;
                }

                .admin-sidebar {
                    width: 250px;
                    position: fixed;
                    height: 100vh;
                    background-color: #1C2434;
                    z-index: 1000;
                    transition: width 0.3s ease, transform 0.3s ease;
                    transform: translateX(0);
                }

                .admin-sidebar.collapsed {
                    width: 70px;
                }
                    
                .admin-main-content {
                    margin-left: 250px;
                    width: calc(100% - 250px);
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                    transition: margin-left 0.3s ease, width 0.3s ease;
                }

                .admin-main-content.sidebar-collapsed {
                    margin-left: 70px;
                    width: calc(100% - 70px);
                }

                .admin-main-content.sidebar-closed {
                    margin-left: 0;
                    width: 100%;
                }

                .admin-topbar {
                    height: 60px;
                    background-color: #fff;
                    z-index: 999;
                    position: fixed;
                    width: calc(100% - 250px);
                    top: 0;
                    border-bottom: 1px solid #ddd;
                    transition: width 0.3s ease;
                }

                .admin-topbar.sidebar-collapsed {
                    width: calc(100% - 70px);
                }

                .admin-topbar.sidebar-closed {
                    width: 100%;
                }

                .admin-scrollable-content {
                    margin-top: 50px;
                    padding: 20px;
                    overflow-y: auto;
                    height: calc(100vh - 60px);
                    background-color: #f8f9fa;
                }

                .sidebar-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                    display: none;
                }

                .sidebar-overlay.show {
                    display: block;
                }

                @media (max-width: 768px) {
                    .admin-sidebar {
                        transform: translateX(-100%) !important;
                        z-index: 1050;
                        width: 250px !important;
                    }
                    
                    .admin-sidebar.collapsed {
                        width: 250px !important;
                    }
                    
                    .admin-sidebar.mobile-open {
                        transform: translateX(0) !important;
                    }
                    
                    .admin-main-content,
                    .admin-main-content.sidebar-collapsed {
                        margin-left: 0;
                        width: 100%;
                    }
                    
                    .admin-topbar,
                    .admin-topbar.sidebar-collapsed {
                        width: 100%;
                        padding-left: 15px;
                        padding-right: 15px;
                    }
                    
                    .admin-scrollable-content {
                        padding: 15px;
                    }
                    
                    .table-responsive {
                        font-size: 0.875rem;
                    }
                    
                    .custom-table th,
                    .custom-table td {
                        padding: 0.5rem 0.25rem;
                        vertical-align: middle;
                        white-space: nowrap;
                    }
                    
                    .mobile-card-table {
                        display: none;
                    }
                    
                    .mobile-card-table .card {
                        margin-bottom: 0.75rem;
                        border: 1px solid #e9ecef;
                        border-radius: 8px;
                    }
                    
                    .mobile-card-table .card-body {
                        padding: 0.75rem;
                    }
                    
                    .mobile-card-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0.25rem 0;
                        border-bottom: 1px solid #f8f9fa;
                    }
                    
                    .mobile-card-item:last-child {
                        border-bottom: none;
                    }
                    
                    .mobile-card-label {
                        font-weight: 600;
                        color: #6c757d;
                        font-size: 0.8rem;
                    }
                    
                    .mobile-card-value {
                        font-size: 0.85rem;
                        text-align: right;
                    }
                    
                    .card {
                        margin-bottom: 1rem;
                        border-radius: 8px;
                    }
                    
                    .card-body {
                        padding: 1rem;
                    }
                    
                    .btn {
                        font-size: 0.875rem;
                        padding: 0.5rem 1rem;
                    }
                    
                    .form-control {
                        font-size: 0.875rem;
                    }
                }

                @media (max-width: 480px) {
                    .admin-scrollable-content {
                        padding: 10px;
                    }
                    
                    .admin-topbar {
                        padding-left: 10px;
                        padding-right: 10px;
                    }
                    
                    .table-responsive {
                        display: none;
                    }
                    
                    .mobile-card-table {
                        display: block;
                    }
                    
                    .card-body {
                        padding: 0.75rem;
                    }
                    
                    .modal-dialog {
                        margin: 0.25rem;
                        max-width: calc(100% - 0.5rem);
                    }
                    
                    .modal-body {
                        padding: 0.75rem;
                    }
                    
                    .modal-header {
                        padding: 0.75rem;
                    }
                    
                    .form-control {
                        font-size: 0.8rem;
                        padding: 0.5rem;
                    }
                    
                    .btn {
                        font-size: 0.8rem;
                        padding: 0.5rem 0.75rem;
                    }
                    
                    .calendar-day-btn {
                        min-width: 70px !important;
                        font-size: 0.75rem;
                    }
                    
                    .calendar-day-btn div {
                        font-size: 0.7rem !important;
                    }
                    
                    .manual-heading {
                        font-size: 1.25rem !important;
                    }
                }
            `}</style>

            <div className="admin-layout" key={pathname}>
                <div
                    className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                />
                <AdminSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={sidebarCollapsed}
                />
                <div
                    className={`admin-main-content ${sidebarCollapsed ? "sidebar-collapsed" : ""
                        }`}
                >
                    <AdminTopbar
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        sidebarOpen={sidebarOpen}
                        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                        sidebarCollapsed={sidebarCollapsed}
                        pageName={getPageName(pathname)}
                    />
                    <div className="admin-scrollable-content">
                        <Outlet key={pathname} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLayout;
