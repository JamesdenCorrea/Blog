import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchComments, createComment } from '../store/commentSlice';
import CommentItem from './CommentItem';

interface CommentSectionProps {
    blogId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ blogId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { comments, loading } = useSelector((state: RootState) => state.comments);
    const { user } = useSelector((state: RootState) => state.auth);

    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string>('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch comments when component mounts
    useEffect(() => {
        dispatch(fetchComments(blogId));
    }, [dispatch, blogId]);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (selectedFile) {
            // Validate file size (max 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size should be less than 10MB');
                return;
            }

            setFile(selectedFile);

            // Create preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview('');
            }
            setError('');
        }
    };

    // Remove selected file
    const handleRemoveFile = () => {
        setFile(null);
        setFilePreview('');
    };

    // Handle comment submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            await dispatch(createComment({
                blogId,
                content,
                file: file || undefined
            })).unwrap();

            // Clear form
            setContent('');
            setFile(null);
            setFilePreview('');
        } catch (err: any) {
            setError(err.message || 'Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            marginTop: '40px',
            paddingTop: '30px',
            borderTop: '2px solid #e0e0e0'
        }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
                Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} style={{
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1rem' }}>
                        Add a Comment
                    </h3>

                    {error && (
                        <div style={{
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '15px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your comment here..."
                        required
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            marginBottom: '15px'
                        }}
                    />

                    {/* File Upload Section */}
                    <div style={{ marginBottom: '15px' }}>
                        {filePreview && (
                            <div style={{
                                marginBottom: '15px',
                                position: 'relative',
                                display: 'inline-block'
                            }}>
                                <img
                                    src={filePreview}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '200px',
                                        maxHeight: '200px',
                                        borderRadius: '4px',
                                        border: '2px solid #4CAF50'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '25px',
                                        height: '25px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {file && !filePreview && (
                            <div style={{
                                marginBottom: '15px',
                                padding: '10px',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span style={{ fontSize: '14px' }}>📎 {file.name}</span>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    style={{
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        {!file && (
                            <div>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="comment-file-upload"
                                    accept="*/*"
                                />
                                <label
                                    htmlFor="comment-file-upload"
                                    style={{
                                        display: 'inline-block',
                                        padding: '8px 16px',
                                        backgroundColor: '#757575',
                                        color: 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    📎 Attach File
                                </label>
                                <p style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    marginTop: '8px',
                                    marginBottom: 0
                                }}>
                                    Optional: Attach an image or file (Max 10MB)
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            opacity: submitting ? 0.7 : 1
                        }}
                    >
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            ) : (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    marginBottom: '30px',
                    textAlign: 'center',
                    color: '#666'
                }}>
                    Please log in to comment
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Loading comments...
                </div>
            ) : comments.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#999',
                    fontSize: '16px'
                }}>
                    No comments yet. Be the first to comment!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;