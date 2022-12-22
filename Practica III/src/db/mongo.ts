import {
  Database,
  MongoClient,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { UserSchema, AuthorSchema, BookSchema } from "./schemas.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

await config({ export: true, allowEmptyValues: true });

const connectMongoDB = async (): Promise<Database> => {
  const mongo_usr = Deno.env.get("MONGO_USR");
  const mongo_pwd = Deno.env.get("MONGO_PWD");
  const db_name = Deno.env.get("DB_NAME");
  const mongo_uri = Deno.env.get("URL_MONGO");

  const mongo_url = `mongodb+srv://${mongo_usr}:${mongo_pwd}@${mongo_uri}/${db_name}?authMechanism=SCRAM-SHA-1`;

  const client = new MongoClient();
  await client.connect(mongo_url);
  return client.database(db_name);
};

const db = await connectMongoDB();
console.info(`MongoDB ${db.name} connected`);

export const UsersCollection = db.collection<UserSchema>("Users");
export const BooksCollection = db.collection<BookSchema>("Books");
export const AuthorsCollection = db.collection<AuthorSchema>("Authors");
