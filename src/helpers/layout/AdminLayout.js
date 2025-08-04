import { Outlet } from "react-router-dom";
import AdminTopbar from "../../pages/admin/header/AdminTopbar";
import AdminSidebar from "../../pages/admin/sidebar/AdminSidebar";

const AdminLayout = () => {
    return (
        <>
           <style>{`
                .admin-layout {
                    display: flex;
                    height: 100vh;
                    overflow: hidden;
                }

                .admin-layout > :first-child {
                    width: 250px;
                    position: fixed;
                    height: 100vh;
                    background-color: #fff;
                    z-index: 1000;
                    border-right: 1px solid #ddd;
                }

                .admin-main-content {
                    margin-left: 250px;
                    width: calc(100% - 250px);
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                }

                .admin-main-content > :first-child {
                    height: 60px;
                    background-color: #fff;
                    z-index: 1001;
                    position: fixed;
                    width: calc(100% - 250px);
                    top: 0;
                    border-bottom: 1px solid #ddd;
                }

                .admin-scrollable-content {
                    margin-top: 60px;
                    padding: 20px;
                    overflow-y: auto;
                    height: calc(100vh - 60px);
                    background-color: #f8f9fa;
                }
            `}</style>

            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-main-content">
                    <AdminTopbar />
                    <div className="admin-scrollable-content">
                        <Outlet />
                    </div>
                </div>
            </div>

        </>
    );
};

export default AdminLayout;
