export class Author {
  id!: string;
  firstName!: string;
  lastName!: string;
  imageUrl?: string;
}

export class Comment {
  id!: string;
  details!: string;
  userId!: string;
  postId!: string;
  parentCommentId?: string;
  createdAt!: Date;
  updatedAt!: Date;
  user!: Author;
  subComments?: Comment[];
}

export class Post {
  id!: string;
  title!: string;
  content!: string;
  imageUrl?: string;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  user!: Author;
  likesCount!: number;
  comments?: Comment[];
}

export class PaginationMeta {
  totalItems!: number;
  itemCount!: number;
  itemsPerPage!: number;
  totalPages!: number;
  currentPage!: number;
}

export class GetPostsResponse {
  items!: Post[];
  meta!: PaginationMeta;
}
