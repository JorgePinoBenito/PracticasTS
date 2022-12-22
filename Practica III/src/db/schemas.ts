import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { User, Book, Author } from "../model/types.ts";

export type UserSchema = Omit<User, "cart"> & {
  _id: ObjectId;
  cartBookIDs: ObjectId[];
};

export type BookSchema = Omit<Book, "author"> & {
  _id: ObjectId;
  authorID: ObjectId;
};

export type AuthorSchema = Omit<Author, "books"> & {
  _id: ObjectId;
  bookIDs: ObjectId[];
};
