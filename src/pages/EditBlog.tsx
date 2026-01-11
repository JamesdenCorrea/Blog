import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { fetchBlogById, updateBlog, clearCurrentBlog } from '../store/blogSlice';

const EditBlog: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Get blog ID from URL parameter
    const { id } = useParams<{ id: string }>();

    // Get current blog and user from Redux
    const { currentBlog, loading } = useSelector((state: RootState) => state.blogs);
    const { user } = useSelector((state: RootState) => state.auth);

    // Local state for form inputs
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch blog data when component mounts
    useEffect(() => {
        if (id) {
            dispatch(fetchBlogById(id));
        }

        // Cleanup: clear current blog when component unmounts
        return () => {
            dispatch(clearCurrentBlog());
        };
    }, [dispatch, id]);

    // Populate form when blog data is loaded
    useEffect(() => {
        if (currentBlog) {
            // Check if current user owns this blog
            if (user && currentBlog.author_id !== user.id) {
                alert('You can only edit your own blogs');
                navigate('/');
                return;
            }

            // Set form fields with current blog data
            setTitle(currentBlog.title);
            setContent(currentBlog.content);
        }
    }, [currentBlog, user, navigate]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setError('');
        setSubmitting(true);

        try {
            // Dispatch updateBlog action
            await dispatch(updateBlog({ id, title, content })).unwrap();
            navigate('/');  // Redirect to blog list on success
        } catch (err: any) {
            setError(err.message || 'Failed to update blog');
        } finally {
            setSubmitting(false);
        }
    };

    // Show loading state while fetching blog
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading blog...</div>;
    }

    // Show error if blog not found
    if (!currentBlog) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Blog not found</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1>Edit Blog</h1>

            {error && (
                <div style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Title:
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '16px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Content:
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={15}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '16px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {submitting ? 'Updating...' : 'Update Blog'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#757575',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditBlog;