import { Outlet } from "react-router-dom";
import AdminTopbar from "../../pages/admin/header/AdminTopbar";
import AdminSidebar from "../../pages/admin/sidebar/AdminSidebar";

const AdminLayout = () => {
    return (
        <>
            <div className="d-flex">
                <AdminSidebar />
                <div className="flex-grow-1">
                    <AdminTopbar />
                    <main className="p-4">
                        <Outlet />
                    </main>
                </div>
            </div>

        </>
    );
};

export default AdminLayout;
