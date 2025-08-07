import React from 'react';
import AdminNav from './AdminNav';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <main className="py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout; 