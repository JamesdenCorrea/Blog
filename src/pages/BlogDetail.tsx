import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { fetchBlogById, deleteBlog, clearCurrentBlog } from '../store/blogSlice';

const BlogDetail: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Get blog ID from URL (e.g., /blog/123)
    const { id } = useParams<{ id: string }>();

    // Get current blog and user from Redux
    const { currentBlog, loading } = useSelector((state: RootState) => state.blogs);
    const { user } = useSelector((state: RootState) => state.auth);

    // Fetch blog when component mounts
    useEffect(() => {
        if (id) {
            dispatch(fetchBlogById(id));
        }

        // Cleanup: clear current blog when component unmounts
        return () => {
            dispatch(clearCurrentBlog());
        };
    }, [dispatch, id]);

    // Handle blog deletion
    const handleDelete = async () => {
        if (!id) return;

        if (window.confirm('Are you sure you want to delete this blog?')) {
            await dispatch(deleteBlog(id));
            navigate('/');  // Redirect to home after deletion
        }
    };

    // Show loading state
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading blog...</div>;
    }

    // Show error if blog not found
    if (!currentBlog) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Blog not found</h2>
                <Link to="/">
                    <button style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        Back to Blogs
                    </button>
                </Link>
            </div>
        );
    }

    // Check if current user is the author of this blog
    const isAuthor = user && user.id === currentBlog.author_id;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Back button */}
            <Link to="/">
                <button style={{
                    marginBottom: '20px',
                    padding: '8px 16px',
                    backgroundColor: '#757575',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    ← Back to All Blogs
                </button>
            </Link>

            {/* Blog content card */}
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '30px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                {/* Blog title */}
                <h1 style={{
                    marginTop: 0,
                    marginBottom: '20px',
                    fontSize: '2rem',
                    color: '#333'
                }}>
                    {currentBlog.title}
                </h1>

                {/* Author and date info */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    marginBottom: '30px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid #eee',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    <div>
                        <strong>Author:</strong> {currentBlog.author_email || 'Unknown'}
                    </div>
                    <div>
                        <strong>Posted:</strong> {new Date(currentBlog.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                    {/* Show update date if different from creation date */}
                    {currentBlog.updated_at !== currentBlog.created_at && (
                        <div>
                            <strong>Updated:</strong> {new Date(currentBlog.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    )}
                </div>

                {/* Full blog content */}
                <div style={{
                    lineHeight: '1.8',
                    fontSize: '16px',
                    color: '#333',
                    whiteSpace: 'pre-wrap',  // Preserve line breaks from the author
                    wordWrap: 'break-word'    // Wrap long words
                }}>
                    {currentBlog.content}
                </div>

                {/* Edit and Delete buttons (only show to author) */}
                {isAuthor && (
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        marginTop: '40px',
                        paddingTop: '20px',
                        borderTop: '1px solid #eee'
                    }}>
                        <Link to={`/edit/${currentBlog.id}`}>
                            <button style={{
                                backgroundColor: '#2196F3',
                                color: 'white',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}>
                                Edit Blog
                            </button>
                        </Link>

                        <button
                            onClick={handleDelete}
                            style={{
                                backgroundColor: '#f44336',
                                color: 'white',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Delete Blog
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogDetail;