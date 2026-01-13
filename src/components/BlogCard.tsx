import React from 'react';
import { Link } from 'react-router-dom';
import { Blog } from '../types';

interface BlogCardProps {
    blog: Blog;
    currentUserId?: string;
    onDelete: (id: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, currentUserId, onDelete }) => {
    const isAuthor = currentUserId === blog.author_id;

    return (
        <div
            style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
        >
            {/* Featured Image - displayed at the top if exists */}
            {blog.image_url && (
                <Link to={`/blog/${blog.id}`}>
                    <img
                        src={blog.image_url}
                        alt={blog.title}
                        style={{
                            width: '100%',
                            height: '250px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            cursor: 'pointer',
                            display: 'block'
                        }}
                    />
                </Link>
            )}

            {/* Blog title - clickable link to full post */}
            <Link
                to={`/blog/${blog.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
            >
                <h2
                    style={{
                        marginTop: 0,
                        marginBottom: '15px',
                        color: '#2196F3',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#1976D2';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#2196F3';
                    }}
                >
                    {blog.title}
                </h2>
            </Link>

            {/* Author and date info */}
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '15px',
                fontSize: '14px',
                color: '#666',
                flexWrap: 'wrap'
            }}>
                <div>
                    <strong>By:</strong> {blog.author_email || 'Unknown Author'}
                </div>
                <div>
                    <strong>Posted:</strong> {new Date(blog.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {/* Content preview - first 150 characters */}
            <p style={{
                color: '#333',
                lineHeight: '1.6',
                marginBottom: '15px'
            }}>
                {blog.content.substring(0, 150)}
                {blog.content.length > 150 && '...'}
            </p>

            {/* Read More link */}
            <Link
                to={`/blog/${blog.id}`}
                style={{
                    color: '#2196F3',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                }}
            >
                Read Full Post →
            </Link>

            {/* Edit and Delete buttons - only show if user owns this blog */}
            {isAuthor && (
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '20px',
                    paddingTop: '15px',
                    borderTop: '1px solid #eee'
                }}>
                    <Link to={`/edit/${blog.id}`}>
                        <button style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}>
                            Edit
                        </button>
                    </Link>

                    <button
                        onClick={() => onDelete(blog.id)}
                        style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default BlogCard;