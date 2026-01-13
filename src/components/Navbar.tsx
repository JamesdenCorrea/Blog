import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../store/authSlice';

const Navbar: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    // Handle logout button click
    const handleLogout = async () => {
        await dispatch(logout());  // Dispatch logout action
        navigate('/login');        // Redirect to login page
    };

    return (
        <nav style={{
            backgroundColor: '#333',
            padding: '1rem',
            color: 'white',
            marginBottom: '20px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    James Correa Blog
                </Link>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {isAuthenticated ? (
                        // Show these links only when user is logged in
                        <>
                            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                                All Blogs
                            </Link>
                            <Link to="/create" style={{ color: 'white', textDecoration: 'none' }}>
                                Create Blog
                            </Link>
                            <span style={{ color: '#ccc' }}>{user?.email}</span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        // Show these links when user is not logged in
                        <>
                            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                                Login
                            </Link>
                            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;