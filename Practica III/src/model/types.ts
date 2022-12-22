export type User = {
    name: string;
    password: string;
    createdAt: Date;
    cart: Array<Book>;
    email: string;
};

export type Book = {
    title: string;
    author: Author;
    pages: number;
    ISBN: string;
};

export type Author = {
    name: string;
    books: Book[];
};
