import {RouterContext, Status} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {BooksCollection, UsersCollection} from "../db/mongo.ts";
import {formatError, idValidator} from "../model/validation.ts";
import {z} from "https://deno.land/x/zod@v3.19.1/mod.ts"

type UpdateCartContext = RouterContext<"/updateCart",
    Record<string | number, string | undefined>,
    Record<string, any>>;

const updateCartValidator = z.object({
    id_book: idValidator,
    id_user: idValidator,
}).strict();

// Fixme: PATCH - Not idempotent, partial update.
/**
 * PUT /updateCart
 * Adds a book to user's cart.
 *
 * REQUEST
 * Body: JSON - {
 *     id_book: ObjectId,
 *     id_user: ObjectId
 * }
 *
 * RESPONSE
 *  - 204
 *  - 400: TEXT - Validation errors.
 *  - 404: TEXT - The resource not found.
 *  - 500
 */
export const updateCart = async (ctx: UpdateCartContext) => {
    const value = await ctx.request.body({type: "json"}).value;

    let params;
    try {
        params = updateCartValidator.parse(value);
    } catch (e) {
        ctx.throw(Status.BadRequest, formatError(e));
    }

    if (await UsersCollection.countDocuments(
        {_id: params.id_user},
        {limit: 1},
    ) === 0) {
        ctx.throw(Status.NotFound, "user not found");
    }

    if (await BooksCollection.countDocuments(
        {_id: params.id_book},
        {limit: 1},
    ) === 0) {
        ctx.throw(Status.NotFound, "book not found");
    }

    await UsersCollection.updateOne(
        {_id: params.id_user},
        {$push: {cartBookIDs: params.id_book}} as any,
        {},
    );

    ctx.response.status = Status.NoContent;
};
