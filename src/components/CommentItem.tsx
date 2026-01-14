import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { updateComment, deleteComment } from '../store/commentSlice';
import { Comment } from '../types';

interface CommentItemProps {
    comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editFilePreview, setEditFilePreview] = useState<string>('');
    const [removeFile, setRemoveFile] = useState(false);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);

    const isAuthor = user && user.id === comment.author_id;

    // Handle file selection for editing
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size should be less than 10MB');
                return;
            }

            setEditFile(file);
            setRemoveFile(false);

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setEditFilePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setEditFilePreview('');
            }
            setError('');
        }
    };

    // Handle comment update
    const handleUpdate = async () => {
        if (!editContent.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        setError('');
        setUpdating(true);

        try {
            await dispatch(updateComment({
                id: comment.id,
                content: editContent,
                file: editFile || undefined,
                removeFile
            })).unwrap();
            setIsEditing(false);
            setEditFile(null);
            setEditFilePreview('');
            setRemoveFile(false);
        } catch (err: any) {
            setError(err.message || 'Failed to update comment');
        } finally {
            setUpdating(false);
        }
    };

    // Handle comment deletion
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            await dispatch(deleteComment(comment.id));
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        setEditContent(comment.content);
        setEditFile(null);
        setEditFilePreview('');
        setRemoveFile(false);
        setError('');
    };

    // Check if file is an image
    const isImage = comment.file_type?.startsWith('image/');

    return (
        <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: '#fafafa'
        }}>
            {/* Comment Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                paddingBottom: '10px',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <div style={{ fontSize: '14px', color: '#666' }}>
                    <strong>{comment.author_email || 'Unknown'}</strong>
                    <span style={{ margin: '0 8px' }}>•</span>
                    <span>{new Date(comment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                    {comment.updated_at !== comment.created_at && (
                        <span style={{ fontStyle: 'italic', marginLeft: '8px' }}>(edited)</span>
                    )}
                </div>

                {/* Edit and Delete buttons for author */}
                {isAuthor && !isEditing && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: '4px 12px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            style={{
                                padding: '4px 12px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Mode */}
            {isEditing ? (
                <div>
                    {error && (
                        <div style={{
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            padding: '8px',
                            borderRadius: '4px',
                            marginBottom: '10px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            minHeight: '80px',
                            marginBottom: '10px'
                        }}
                    />

                    {/* File Management in Edit Mode */}
                    <div style={{ marginBottom: '10px' }}>
                        {/* Show new file preview */}
                        {editFilePreview && (
                            <div style={{ marginBottom: '10px' }}>
                                <img
                                    src={editFilePreview}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '200px',
                                        maxHeight: '200px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd'
                                    }}
                                />
                            </div>
                        )}

                        {/* Show existing file if not removed and no new file */}
                        {!editFile && comment.file_url && !removeFile && (
                            <div style={{
                                marginBottom: '10px',
                                padding: '10px',
                                backgroundColor: '#fff3cd',
                                borderRadius: '4px'
                            }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Current file: {comment.file_name}</p>
                                <button
                                    type="button"
                                    onClick={() => setRemoveFile(true)}
                                    style={{
                                        padding: '4px 12px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    Remove File
                                </button>
                            </div>
                        )}

                        {/* Show message if file marked for removal */}
                        {removeFile && !editFile && (
                            <div style={{
                                marginBottom: '10px',
                                padding: '10px',
                                backgroundColor: '#ffebee',
                                borderRadius: '4px'
                            }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>File will be removed</p>
                                <button
                                    type="button"
                                    onClick={() => setRemoveFile(false)}
                                    style={{
                                        padding: '4px 12px',
                                        backgroundColor: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    Keep File
                                </button>
                            </div>
                        )}

                        {/* File upload button */}
                        {!editFile && (
                            <div>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id={`file-edit-${comment.id}`}
                                />
                                <label
                                    htmlFor={`file-edit-${comment.id}`}
                                    style={{
                                        display: 'inline-block',
                                        padding: '6px 12px',
                                        backgroundColor: '#757575',
                                        color: 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    {comment.file_url && !removeFile ? 'Change File' : 'Add File'}
                                </label>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleUpdate}
                            disabled={updating}
                            style={{
                                padding: '6px 16px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: updating ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                opacity: updating ? 0.7 : 1
                            }}
                        >
                            {updating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={updating}
                            style={{
                                padding: '6px 16px',
                                backgroundColor: '#757575',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                /* View Mode */
                <div>
                    <p style={{
                        margin: '0 0 10px 0',
                        lineHeight: '1.6',
                        fontSize: '14px',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word'
                    }}>
                        {comment.content}
                    </p>

                    {/* Display attached file */}
                    {comment.file_url && (
                        <div style={{ marginTop: '10px' }}>
                            {isImage ? (
                                <a href={comment.file_url} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={comment.file_url}
                                        alt={comment.file_name || 'Attachment'}
                                        style={{
                                            maxWidth: '300px',
                                            maxHeight: '300px',
                                            borderRadius: '4px',
                                            border: '1px solid #ddd',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </a>
                            ) : (
                                <a
                                    href={comment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        backgroundColor: '#e3f2fd',
                                        color: '#1976d2',
                                        borderRadius: '4px',
                                        textDecoration: 'none',
                                        fontSize: '14px'
                                    }}
                                >
                                    📎 {comment.file_name || 'Download attachment'}
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentItem;