import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden print:h-auto print:overflow-visible print:block print:bg-white">
      <Sidebar />
      <div className="flex-1 ml-64 print:ml-0 h-full overflow-y-auto relative scroll-smooth print:h-auto print:overflow-visible print:w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;