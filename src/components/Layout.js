import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Companies', href: '/companies', icon: Building2 },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex' }}>
      <div style={{
        position: 'fixed',
        insetY: 0,
        left: 0,
        zIndex: 20,
        width: '256px',
        backgroundColor: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          height: '64px', 
          padding: '0 24px', 
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Admin Panel</h1>
        </div>
        
        <nav style={{ marginTop: '32px' }}>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: isActive(item.href) ? '#dbeafe' : 'transparent',
                    color: isActive(item.href) ? '#1d4ed8' : '#374151'
                  }}
                >
                  <Icon style={{ marginRight: '12px', height: '20px', width: '20px' }} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: '256px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: '64px', 
            padding: '0 32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
              <span style={{ fontSize: '14px', color: '#374151' }}>Admin User</span>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#6b7280',
                  textDecoration: 'none',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'color 0.2s'
                }}
              >
                <LogOut style={{ height: '16px', width: '16px' }} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <main style={{ padding: '24px', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
