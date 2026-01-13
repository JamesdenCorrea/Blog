import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { fetchBlogById, updateBlog, clearCurrentBlog } from '../store/blogSlice';

const EditBlog: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();

    const { currentBlog, loading } = useSelector((state: RootState) => state.blogs);
    const { user } = useSelector((state: RootState) => state.auth);

    // Local state for form inputs
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [existingImageUrl, setExistingImageUrl] = useState<string>('');
    const [removeExistingImage, setRemoveExistingImage] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch blog data when component mounts
    useEffect(() => {
        if (id) {
            dispatch(fetchBlogById(id));
        }

        return () => {
            dispatch(clearCurrentBlog());
        };
    }, [dispatch, id]);

    // Populate form when blog data is loaded
    useEffect(() => {
        if (currentBlog) {
            if (user && currentBlog.author_id !== user.id) {
                alert('You can only edit your own blogs');
                navigate('/');
                return;
            }

            setTitle(currentBlog.title);
            setContent(currentBlog.content);

            // Set existing image if available
            if (currentBlog.image_url) {
                setExistingImageUrl(currentBlog.image_url);
            }
        }
    }, [currentBlog, user, navigate]);

    // Handle new image file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            setImage(file);
            setRemoveExistingImage(false); // Cancel remove if new image selected

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    // Remove new image preview
    const handleRemoveNewImage = () => {
        setImage(null);
        setImagePreview('');
    };

    // Mark existing image for removal
    const handleRemoveExistingImage = () => {
        setRemoveExistingImage(true);
        setExistingImageUrl('');
    };

    // Cancel removal of existing image
    const handleKeepExistingImage = () => {
        setRemoveExistingImage(false);
        if (currentBlog?.image_url) {
            setExistingImageUrl(currentBlog.image_url);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setError('');
        setSubmitting(true);

        try {
            await dispatch(updateBlog({
                id,
                title,
                content,
                image: image || undefined,
                removeImage: removeExistingImage
            })).unwrap();
            navigate('/');
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
                {/* Title Input */}
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

                {/* Image Management */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Featured Image:
                    </label>

                    {/* Show new image preview if user selected one */}
                    {imagePreview && (
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                New Image:
                            </p>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img
                                    src={imagePreview}
                                    alt="New preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        borderRadius: '8px',
                                        border: '2px solid #4CAF50'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveNewImage}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        cursor: 'pointer',
                                        fontSize: '18px'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Show existing image if no new image and not marked for removal */}
                    {!imagePreview && existingImageUrl && !removeExistingImage && (
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                Current Image:
                            </p>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img
                                    src={existingImageUrl}
                                    alt="Current"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        borderRadius: '8px',
                                        border: '2px solid #ddd'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveExistingImage}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        cursor: 'pointer',
                                        fontSize: '18px'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Show message if image marked for removal */}
                    {removeExistingImage && !imagePreview && (
                        <div style={{
                            marginBottom: '15px',
                            padding: '15px',
                            backgroundColor: '#fff3cd',
                            borderRadius: '4px',
                            border: '1px solid #ffc107'
                        }}>
                            <p style={{ margin: 0, fontSize: '14px' }}>
                                Image will be removed when you save changes.
                            </p>
                            <button
                                type="button"
                                onClick={handleKeepExistingImage}
                                style={{
                                    marginTop: '10px',
                                    padding: '6px 12px',
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Keep Image
                            </button>
                        </div>
                    )}

                    {/* Upload new image button */}
                    {!imagePreview && (
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                style={{
                                    display: 'inline-block',
                                    padding: '10px 20px',
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {existingImageUrl && !removeExistingImage ? 'Change Image' : 'Upload Image'}
                            </label>
                            <p style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '8px',
                                marginBottom: 0
                            }}>
                                Accepted: JPG, PNG, GIF (Max 5MB)
                            </p>
                        </div>
                    )}
                </div>

                {/* Content Textarea */}
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

                {/* Action Buttons */}
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
                            fontSize: '16px',
                            opacity: submitting ? 0.7 : 1
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