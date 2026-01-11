import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { fetchBlogs, deleteBlog } from '../store/blogSlice';
import BlogCard from '../components/BlogCard';

const BlogList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Get blogs and user data from Redux store
    const { blogs, loading, totalPages } = useSelector((state: RootState) => state.blogs);
    const { user } = useSelector((state: RootState) => state.auth);

    // Local state for current page number and sort order
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // Fetch blogs when component mounts or page/sort changes
    useEffect(() => {
        dispatch(fetchBlogs(currentPage));
    }, [dispatch, currentPage]);

    // Handle blog deletion
    const handleDelete = async (id: string) => {
        // Ask for confirmation before deleting
        if (window.confirm('Are you sure you want to delete this blog?')) {
            await dispatch(deleteBlog(id));
            // Reload current page after deletion
            dispatch(fetchBlogs(currentPage));
        }
    };

    // Sort blogs based on selected order
    // We create a copy of the array before sorting to avoid mutating Redux state
    const sortedBlogs = [...blogs].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();

        // If newest first, sort descending (b - a)
        // If oldest first, sort ascending (a - b)
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Show loading state
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading blogs...</div>;
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <h1>All Blogs</h1>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Sort dropdown */}
                    <label style={{ fontSize: '14px', color: '#666' }}>Sort by:</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>

                    <Link to="/create">
                        <button style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}>
                            Create New Blog
                        </button>
                    </Link>
                </div>
            </div>

            {/* Show message if no blogs exist */}
            {sortedBlogs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>
                    No blogs yet. Create your first blog!
                </p>
            ) : (
                <>
                    {/* Map through sorted blogs and display each using BlogCard component */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {sortedBlogs.map((blog) => (
                            <BlogCard
                                key={blog.id}
                                blog={blog}
                                currentUserId={user?.id}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px',
                            marginTop: '30px',
                            alignItems: 'center'
                        }}>
                            {/* Previous button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: currentPage === 1 ? '#ccc' : '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Previous
                            </button>

                            {/* Page indicator */}
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>

                            {/* Next button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: currentPage === totalPages ? '#ccc' : '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BlogList;