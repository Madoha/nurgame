import React from "react";
import { Outlet } from "react-router-dom";
import HeaderNew from "./header/HeaderNew.tsx";

const Layout: React.FC = () => {
    return (
        <div className={"pagesConfig"}>
            <HeaderNew />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
