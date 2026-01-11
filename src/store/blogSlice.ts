import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../services/supabase';
import { BlogState, Blog } from '../types';

const initialState: BlogState = {
    blogs: [],              // Empty array of blogs initially
    currentBlog: null,      // No blog selected
    loading: false,         // Not loading
    error: null,            // No errors
    totalPages: 0,          // No pages calculated yet
};

const ITEMS_PER_PAGE = 5;  // How many blogs to show per page

// Async action to fetch blogs with pagination
// Updated to include author email from auth.users table
export const fetchBlogs = createAsyncThunk(
    'blogs/fetchBlogs',
    async (page: number = 1) => {
        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        // Fetch from the view instead of the table
        // This automatically includes author_email
        const { data, error, count } = await supabase
            .from('blogs_with_authors')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

        return { blogs: data as Blog[], totalPages };
    }
);

// Async action to fetch a single blog by ID
// Updated to include author email
export const fetchBlogById = createAsyncThunk(
    'blogs/fetchBlogById',
    async (id: string) => {
        // Fetch from the view instead of the table
        const { data, error } = await supabase
            .from('blogs_with_authors')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Blog;
    }
);

export const createBlog = createAsyncThunk(
    'blogs/createBlog',
    async ({ title, content }: { title: string; content: string }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Insert blog with a custom field for author email (if your table allows it)
        // OR just return it in Redux without storing in DB
        const { data, error } = await supabase
            .from('blogs')
            .insert([{ title, content, author_id: user.id }])
            .select()
            .single();

        if (error) throw error;

        // Add email to the returned data (stored in Redux, not DB)
        return {
            ...data,
            author_email: user.email
        } as Blog;
    }
);

// Async action to update an existing blog
export const updateBlog = createAsyncThunk(
    'blogs/updateBlog',
    async ({ id, title, content }: { id: string; title: string; content: string }) => {
        const { data, error } = await supabase
            .from('blogs')
            .update({ title, content, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // After update, fetch from view to get author_email
        const { data: blogData } = await supabase
            .from('blogs_with_authors')
            .select('*')
            .eq('id', id)
            .single();

        return blogData as Blog;
    }
);

// Async action to delete a blog
export const deleteBlog = createAsyncThunk(
    'blogs/deleteBlog',
    async (id: string) => {
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return id;  // Return the ID of deleted blog
    }
);

// Create blog slice
const blogSlice = createSlice({
    name: 'blogs',
    initialState,
    reducers: {
        // Synchronous action to clear current blog
        clearCurrentBlog: (state) => {
            state.currentBlog = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch blogs states
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
            // Fetch single blog states
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
            // Create blog states
            .addCase(createBlog.fulfilled, (state, action) => {
                state.blogs.unshift(action.payload);  // Add new blog to start of array
            })
            // Update blog states
            .addCase(updateBlog.fulfilled, (state, action) => {
                // Find and update the blog in the array
                const index = state.blogs.findIndex(blog => blog.id === action.payload.id);
                if (index !== -1) {
                    state.blogs[index] = action.payload;
                }
                state.currentBlog = action.payload;
            })
            // Delete blog states
            .addCase(deleteBlog.fulfilled, (state, action) => {
                // Remove deleted blog from array
                state.blogs = state.blogs.filter(blog => blog.id !== action.payload);
            });
    },
});

export const { clearCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer;