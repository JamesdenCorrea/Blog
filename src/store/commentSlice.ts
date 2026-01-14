import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../services/supabase';
import { CommentState, Comment } from '../types';

const initialState: CommentState = {
    comments: [],
    loading: false,
    error: null,
};

// Helper function to upload file to Supabase Storage
const uploadFile = async (file: File, userId: string): Promise<{ url: string; path: string; fileName: string; fileType: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('comment-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('comment-images')
        .getPublicUrl(fileName);

    return {
        url: publicUrl,
        path: fileName,
        fileName: file.name,
        fileType: file.type
    };
};

// Helper function to delete file from Supabase Storage
const deleteFile = async (filePath: string): Promise<void> => {
    const { error } = await supabase.storage
        .from('comment-images')
        .remove([filePath]);

    if (error) throw error;
};

// Fetch all comments for a blog
export const fetchComments = createAsyncThunk(
    'comments/fetchComments',
    async (blogId: string) => {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('blog_id', blogId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Comment[];
    }
);

// Create a new comment with optional file attachment
export const createComment = createAsyncThunk(
    'comments/createComment',
    async ({ blogId, content, file }: { blogId: string; content: string; file?: File }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        let fileUrl: string | undefined;
        let filePath: string | undefined;
        let fileName: string | undefined;
        let fileType: string | undefined;

        // Upload file if provided
        if (file) {
            const uploadResult = await uploadFile(file, user.id);
            fileUrl = uploadResult.url;
            filePath = uploadResult.path;
            fileName = uploadResult.fileName;
            fileType = uploadResult.fileType;
        }

        const { data, error } = await supabase
            .from('comments')
            .insert([{
                blog_id: blogId,
                author_id: user.id,
                author_email: user.email,
                content,
                file_url: fileUrl,
                file_path: filePath,
                file_name: fileName,
                file_type: fileType
            }])
            .select()
            .single();

        if (error) throw error;
        return data as Comment;
    }
);

// Update a comment with optional file change
export const updateComment = createAsyncThunk(
    'comments/updateComment',
    async ({
        id,
        content,
        file,
        removeFile
    }: {
        id: string;
        content: string;
        file?: File;
        removeFile?: boolean;
    }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get existing comment to check for old file
        const { data: existingComment } = await supabase
            .from('comments')
            .select('file_path')
            .eq('id', id)
            .single();

        let fileUrl: string | undefined | null;
        let filePath: string | undefined | null;
        let fileName: string | undefined | null;
        let fileType: string | undefined | null;

        // Handle file removal
        if (removeFile && existingComment?.file_path) {
            await deleteFile(existingComment.file_path);
            fileUrl = null;
            filePath = null;
            fileName = null;
            fileType = null;
        }
        // Handle file upload (new or replacement)
        else if (file) {
            if (existingComment?.file_path) {
                await deleteFile(existingComment.file_path);
            }
            const uploadResult = await uploadFile(file, user.id);
            fileUrl = uploadResult.url;
            filePath = uploadResult.path;
            fileName = uploadResult.fileName;
            fileType = uploadResult.fileType;
        }

        const updateData: any = {
            content,
            updated_at: new Date().toISOString()
        };

        // Only update file fields if they were modified
        if (removeFile || file) {
            updateData.file_url = fileUrl;
            updateData.file_path = filePath;
            updateData.file_name = fileName;
            updateData.file_type = fileType;
        }

        const { data, error } = await supabase
            .from('comments')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Comment;
    }
);

// Delete a comment and its file
export const deleteComment = createAsyncThunk(
    'comments/deleteComment',
    async (id: string) => {
        // Get comment to find file path
        const { data: comment } = await supabase
            .from('comments')
            .select('file_path')
            .eq('id', id)
            .single();

        // Delete file from storage if exists
        if (comment?.file_path) {
            await deleteFile(comment.file_path);
        }

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return id;
    }
);

const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        clearComments: (state) => {
            state.comments = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.comments = action.payload;
                state.loading = false;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch comments';
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.comments.unshift(action.payload);
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                const index = state.comments.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.comments[index] = action.payload;
                }
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.comments = state.comments.filter(c => c.id !== action.payload);
            });
    },
});

export const { clearComments } = commentSlice.actions;
export default commentSlice.reducer;