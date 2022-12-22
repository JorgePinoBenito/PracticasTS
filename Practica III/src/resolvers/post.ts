import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";
import { RouterContext, Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {
  UsersCollection,
  AuthorsCollection,
  BooksCollection,
} from "../db/mongo.ts";
import { UserSchema, AuthorSchema, BookSchema } from "../db/schemas.ts";
import { z } from "https://deno.land/x/zod@v3.19.1/mod.ts";
import {
  formatError,
  idValidator,
  nameValidator,
  pagesValidator,
  titleValidator,
} from "../model/validation.ts";
import { InsertDocument } from "https://deno.land/x/mongo@v0.31.1/mod.ts";

type AddUserContext = RouterContext<
  "/addUser",
  Record<string | number, string | undefined>,
  Record<string, any>
>;

type AddAuthorContext = RouterContext<
  "/addAuthor",
  Record<string | number, string | undefined>,
  Record<string, any>
>;

type AddBookContext = RouterContext<
  "/addBook",
  Record<string | number, string | undefined>,
  Record<string, any>
>;

const addUserValidator = z
  .object({
    name: nameValidator,
    email: z
      .string()
      .trim()
      .email()
      .transform((s) => s.toLowerCase()),
    password: z
      .string()
      .min(8)
      .transform(async (s) => {
        return await bcrypt.hash(s);
      }),
  })
  .strict();

/**
 * POST /addUser
 * Creates and inserts a new user.
 *
 * REQUEST
 * Body: JSON - {
 *     name: string,
 *     email: string,
 *     password: string
 * }
 *
 * RESPONSE
 *  - 200: JSON - Newly created User.
 *  - 400: TEXT - Validation errors.
 *  - 500
 */
export const addUser = async (ctx: AddUserContext) => {
  const value = await ctx.request.body({ type: "json" }).value;

  let params;
  try {
    params = await addUserValidator.parseAsync(value);
  } catch (e) {
    ctx.throw(Status.BadRequest, formatError(e));
  }

  const user: InsertDocument<UserSchema> = {
    ...params,
    cartBookIDs: [],
    createdAt: new Date(),
  };

  await UsersCollection.insertOne(user);

  ctx.response.body = user as UserSchema;
};

const addAuthorValidator = z
  .object({
    name: nameValidator,
  })
  .strict();

/**
 * POST /addAuthor
 * Creates and inserts an author.
 *
 * REQUEST
 * Body: JSON - { name: string }
 *
 * RESPONSE
 * Status:
 *  - 200: JSON - Newly created Author.
 *  - 400: TEXT - Validation errors.
 *  - 500
 */
export const addAuthor = async (ctx: AddAuthorContext) => {
  const value = await ctx.request.body({ type: "json" }).value;

  let params;
  try {
    params = addAuthorValidator.parse(value);
  } catch (e) {
    ctx.throw(Status.BadRequest, formatError(e));
  }

  const author: InsertDocument<AuthorSchema> = {
    ...params,
    bookIDs: [],
  };

  await AuthorsCollection.insertOne(author);

  ctx.response.body = author as AuthorSchema;
};

const addBookValidator = z
  .object({
    title: titleValidator,
    author_id: idValidator,
    pages: pagesValidator,
  })
  .strict();

/**
 * POST /addBook
 * Inserts a new book.
 *
 * REQUEST
 * Body: JSON - {
 *      title: string,
 *      author_id: ObjectId,
 *      pages: number,
 * }
 *
 * RESPONSE
 *  - 200: JSON - Newly created book.
 *  - 400: TEXT - Validation errors.
 *  - 404: TEXT - Name of resource not found.
 *  - 500
 */
export const addBook = async (ctx: AddBookContext) => {
  const value = await ctx.request.body({ type: "json" }).value;

  let params;
  try {
    params = addBookValidator.parse(value);
  } catch (e) {
    ctx.throw(Status.BadRequest, formatError(e));
  }

  if (
    (await AuthorsCollection.countDocuments(
      { _id: params.author_id },
      { limit: 1 }
    )) === 0
  ) {
    ctx.throw(Status.NotFound, "author not found");
  }

  const bookInsert: InsertDocument<BookSchema> = {
    authorID: params.author_id,
    title: params.title,
    pages: params.pages,
    ISBN: crypto.randomUUID(),
  };

  const bookID = await BooksCollection.insertOne(bookInsert, {});
  await AuthorsCollection.updateOne({ _id: params.author_id }, {
    $push: { bookIDs: bookID },
  } as any);

  ctx.response.body = bookInsert as BookSchema;
};
