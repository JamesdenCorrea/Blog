import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../services/supabase';
import { BlogState, Blog } from '../types';

const initialState: BlogState = {
    blogs: [],
    currentBlog: null,
    loading: false,
    error: null,
    totalPages: 0,
};

const ITEMS_PER_PAGE = 5;

interface FetchBlogsParams {
    page: number;
    sortOrder?: 'newest' | 'oldest';
}

// Helper function to upload image to Supabase Storage
const uploadImage = async (file: File, userId: string): Promise<{ url: string; path: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

    return { url: publicUrl, path: fileName };
};

// Helper function to delete image from Supabase Storage
const deleteImage = async (imagePath: string): Promise<void> => {
    const { error } = await supabase.storage
        .from('blog-images')
        .remove([imagePath]);

    if (error) throw error;
};

// Fetch blogs with pagination and sorting
export const fetchBlogs = createAsyncThunk(
    'blogs/fetchBlogs',
    async ({ page = 1, sortOrder = 'newest' }: FetchBlogsParams) => {
        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        const ascending = sortOrder === 'oldest';

        // Fetch blogs from database
        // author_email is now stored directly in the blogs table
        const { data: blogsData, error: blogsError, count } = await supabase
            .from('blogs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending })
            .range(from, to);

        if (blogsError) throw blogsError;

        const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;
        return { blogs: blogsData as Blog[], totalPages };
    }
);

// Fetch a single blog by ID
export const fetchBlogById = createAsyncThunk(
    'blogs/fetchBlogById',
    async (id: string) => {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Blog;
    }
);

// Create a new blog with optional image
export const createBlog = createAsyncThunk(
    'blogs/createBlog',
    async ({ title, content, image }: { title: string; content: string; image?: File }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        let imageUrl: string | undefined;
        let imagePath: string | undefined;

        // Upload image if provided
        if (image) {
            const uploadResult = await uploadImage(image, user.id);
            imageUrl = uploadResult.url;
            imagePath = uploadResult.path;
        }

        // Insert blog with author email stored directly
        const { data, error } = await supabase
            .from('blogs')
            .insert([{
                title,
                content,
                author_id: user.id,
                author_email: user.email, // Store email directly
                image_url: imageUrl,
                image_path: imagePath
            }])
            .select()
            .single();

        if (error) throw error;

        return data as Blog;
    }
);

// Update an existing blog with optional image change
export const updateBlog = createAsyncThunk(
    'blogs/updateBlog',
    async ({
        id,
        title,
        content,
        image,
        removeImage
    }: {
        id: string;
        title: string;
        content: string;
        image?: File;
        removeImage?: boolean;
    }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get existing blog to check for old image
        const { data: existingBlog } = await supabase
            .from('blogs')
            .select('image_path')
            .eq('id', id)
            .single();

        let imageUrl: string | undefined | null;
        let imagePath: string | undefined | null;

        // Handle image removal
        if (removeImage && existingBlog?.image_path) {
            await deleteImage(existingBlog.image_path);
            imageUrl = null;
            imagePath = null;
        }
        // Handle image upload (new or replacement)
        else if (image) {
            if (existingBlog?.image_path) {
                await deleteImage(existingBlog.image_path);
            }
            const uploadResult = await uploadImage(image, user.id);
            imageUrl = uploadResult.url;
            imagePath = uploadResult.path;
        }

        // Update blog
        const updateData: any = {
            title,
            content,
            updated_at: new Date().toISOString()
        };

        // Only update image fields if they were modified
        if (removeImage || image) {
            updateData.image_url = imageUrl;
            updateData.image_path = imagePath;
        }

        const { data, error } = await supabase
            .from('blogs')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Blog;
    }
);

// Delete a blog and its image
export const deleteBlog = createAsyncThunk(
    'blogs/deleteBlog',
    async (id: string) => {
        // Get blog to find image path
        const { data: blog } = await supabase
            .from('blogs')
            .select('image_path')
            .eq('id', id)
            .single();

        // Delete image from storage if exists
        if (blog?.image_path) {
            await deleteImage(blog.image_path);
        }

        // Delete blog from database
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return id;
    }
);

// Create blog slice
const blogSlice = createSlice({
    name: 'blogs',
    initialState,
    reducers: {
        clearCurrentBlog: (state) => {
            state.currentBlog = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBlogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.blogs = action.payload.blogs;
                state.totalPages = action.payload.totalPages;
                state.loading = false;
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch blogs';
            })
            .addCase(fetchBlogById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBlogById.fulfilled, (state, action) => {
                state.currentBlog = action.payload;
                state.loading = false;
            })
            .addCase(fetchBlogById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch blog';
            })
            .addCase(createBlog.fulfilled, (state, action) => {
                state.blogs.unshift(action.payload);
            })
            .addCase(updateBlog.fulfilled, (state, action) => {
                const index = state.blogs.findIndex(blog => blog.id === action.payload.id);
                if (index !== -1) {
                    state.blogs[index] = action.payload;
                }
                state.currentBlog = action.payload;
            })
            .addCase(deleteBlog.fulfilled, (state, action) => {
                state.blogs = state.blogs.filter(blog => blog.id !== action.payload);
            });
    },
});

export const { clearCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer;