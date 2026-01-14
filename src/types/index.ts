export interface Blog {
    id: string;
    title: string;
    content: string;
    author_id: string;
    author_email?: string;
    image_url?: string;
    image_path?: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}

export interface BlogState {
    blogs: Blog[];
    currentBlog: Blog | null;
    loading: boolean;
    error: string | null;
    totalPages: number;
}

// Comment interface with file attachment support
export interface Comment {
    id: string;
    blog_id: string;
    author_id: string;
    author_email?: string;
    content: string;
    file_url?: string;
    file_path?: string;
    file_name?: string;
    file_type?: string;
    created_at: string;
    updated_at: string;
}

// CommentState interface
export interface CommentState {
    comments: Comment[];
    loading: boolean;
    error: string | null;
}