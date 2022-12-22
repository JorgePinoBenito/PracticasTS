import {RouterContext, Status} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {UsersCollection} from "../db/mongo.ts";
import {z} from "https://deno.land/x/zod@v3.19.1/mod.ts";
import {formatError, idValidator} from "../model/validation.ts";
import {getQuery} from "https://deno.land/x/oak@v11.1.0/helpers.ts";

type DeleteUserContext = RouterContext<"/deleteUser/:id",
    {
        id: string;
    } & Record<string | number, string | undefined>,
    Record<string, any>>;

const deleteUserValidator = z.object({
    id: idValidator,
});

/**
 * DELETE /deleteUser/:id
 * Deletes user by id.
 *
 * REQUEST
 * URI: - { id: ObjectId }
 *
 * RESPONSE
 *  - 200
 *  - 400: TEXT - Validation errors.
 *  - 404
 *  - 500
 */
export const deleteUser = async (ctx: DeleteUserContext) => {
    let params;
    try {
        params = deleteUserValidator.parse(getQuery(ctx, {mergeParams: true}));
    } catch (e) {
        ctx.throw(Status.BadRequest, formatError(e));
    }

    if (await UsersCollection.deleteOne({id: params.id}) === 0) {
        ctx.throw(Status.NotFound);
    }

    ctx.response.status = Status.OK;
};
