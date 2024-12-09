import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./header/Header.tsx";


const Layout: React.FC = () => {
    return (
        <div className="dashboardHome">
            <Header />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
