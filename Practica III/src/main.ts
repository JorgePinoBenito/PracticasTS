import {
    Application,
    isHttpError,
    Router,
    Status,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import {getBooks, getUser} from "./resolvers/get.ts";
import {deleteUser} from "./resolvers/delete.ts";
import {addUser, addAuthor, addBook} from "./resolvers/post.ts";
import {updateCart} from "./resolvers/put.ts";

const router = new Router();

router
    .get("/getBooks", getBooks)
    .get("/getUser/:id", getUser)
    .post("/addUser", addUser)
    .post("/addAuthor", addAuthor)
    .post("/addBook", addBook)
    .put("/updateCart", updateCart)
    .delete("/deleteUser/:id", deleteUser);

const app = new Application();

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (isHttpError(err) && err.status !== Status.InternalServerError) {
            ctx.response.status = err.status;
            ctx.response.body = err.message;
        } else {
            console.log(err);
            ctx.response.status = Status.InternalServerError;
        }
    }
});

const server_port = Deno.env.get("PORT");

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({port: Number(server_port)});
