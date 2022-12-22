import {ObjectId} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import {z} from "https://deno.land/x/zod@v3.19.1/mod.ts"

export const nameValidator = z.string().trim().min(2);

export const pagesValidator = z.number().nonnegative();

export const titleValidator = z.string().trim().min(1);

export const idValidator = z.string()
    .transform((s, ctx) => {
        try {
            return new ObjectId(s)
        } catch (e) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: e.message,
            })
            return z.NEVER
        }
    });

export function formatError(err: any): string {
    const f = err.format();
    let s = f._errors.join('\n')
    for (const k in f) {
        if (k === "_errors") {
            continue;
        }
        if (f[k]._errors.length > 0) {
            if (s !== "") {
                s += "\n";
            }
            s += `Field ${k}: ` + f[k]._errors.join(', ')
        }
    }
    return s
}