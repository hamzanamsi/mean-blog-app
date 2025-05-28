export interface Role {
  _id: string;
  name: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
  roles?: Role[];
  role?: string; // For backward compatibility
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  article: string; // article ID
  createdAt: string;
}

export interface Article {
  _id: string;
  title: string;
  content: string;
  author: User;
  authorId?: string; // for convenience if backend returns it
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}
