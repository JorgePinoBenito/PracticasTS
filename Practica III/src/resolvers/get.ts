import {RouterContext, Status} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {getQuery} from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import {UsersCollection, BooksCollection} from "../db/mongo.ts";
import {z} from "https://deno.land/x/zod@v3.19.1/mod.ts"
import {
    formatError,
    idValidator,
    pagesValidator,
    titleValidator
} from "../model/validation.ts";

type GetUserContext = RouterContext<"/getUser/:id",
    {
        id: string;
    } & Record<string | number, string | undefined>,
    Record<string, any>>;

type GetBooksContext = RouterContext<"/getBooks",
    Record<string | number, string | undefined>,
    Record<string, any>>;

const getUserValidator = z.object({
    id: idValidator,
}).strict();

/**
 * GET /getUser/:id
 * Returns a user by id.
 *
 * REQUEST
 * URI: - { id: ObjectId }
 *
 * RESPONSE
 *  - 200: JSON - User.
 *  - 400: TEXT - Validation errors.
 *  - 404: TEXT - The resource not found.
 *  - 500
 */
export const getUser = async (ctx: GetUserContext) => {
    const params = getQuery(ctx, {mergeParams: true});
    let validated;
    try {
        validated = getUserValidator.parse(params);
    } catch (e) {
        ctx.throw(Status.BadRequest, formatError(e));
    }

    const user = await UsersCollection.findOne({_id: validated.id});
    if (user === undefined) {
        ctx.throw(Status.NotFound, "User not found");
    }

    ctx.response.body = user;
};

const getBooksValidator = z.object({
    page: z.preprocess(Number, pagesValidator),
    title: titleValidator.optional(),
}).strict();

/**
 * GET /getBooks
 * Returns a paginated list of up to 10 books.
 *
 * REQUEST
 * Query: - {
 *     page: number >= 0,
 *     title?: string
 * }
 *
 * RESPONSE
 *  - 200: JSON - List of books.
 *  - 400: TEXT - Validation errors.
 *  - 404: TEXT - Books not found.
 *  - 500
 */
export const getBooks = async (ctx: GetBooksContext) => {
    let params;
    try {
        params = getBooksValidator.parse(getQuery(ctx))
    } catch (e) {
        ctx.throw(Status.BadRequest, formatError(e))
    }

    const books = await BooksCollection
        .find(params.title !== undefined ? {title: params.title} : undefined)
        .limit(10)
        .skip(Number(params.page) * 10)
        .toArray();

    if (books.length <= 0) {
        ctx.throw(Status.NotFound, "no books found")
    }

    ctx.response.body = books;
};
