import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { fetchBlogById, deleteBlog, clearCurrentBlog } from '../store/blogSlice';
import { clearComments } from '../store/commentSlice';
import CommentSection from '../components/CommentSection';

const BlogDetail: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();

    const { currentBlog, loading } = useSelector((state: RootState) => state.blogs);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (id) {
            dispatch(fetchBlogById(id));
        }

        return () => {
            dispatch(clearCurrentBlog());
            dispatch(clearComments());
        };
    }, [dispatch, id]);

    const handleDelete = async () => {
        if (!id) return;

        if (window.confirm('Are you sure you want to delete this blog?')) {
            await dispatch(deleteBlog(id));
            navigate('/');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading blog...</div>;
    }

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

    const isAuthor = user && user.id === currentBlog.author_id;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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

            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '30px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                {currentBlog.image_url && (
                    <img
                        src={currentBlog.image_url}
                        alt={currentBlog.title}
                        style={{
                            width: '100%',
                            maxHeight: '500px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '30px'
                        }}
                    />
                )}

                <h1 style={{
                    marginTop: 0,
                    marginBottom: '20px',
                    fontSize: '2rem',
                    color: '#333'
                }}>
                    {currentBlog.title}
                </h1>

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

                <div style={{
                    lineHeight: '1.8',
                    fontSize: '16px',
                    color: '#333',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                }}>
                    {currentBlog.content}
                </div>

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

                {/* Comment Section */}
                {id && <CommentSection blogId={id} />}
            </div>
        </div>
    );
};

export default BlogDetail;