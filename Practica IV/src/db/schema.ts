import { Car, Dealer, Salesperson } from "../types.ts";
import { ObjectId } from "mongo";

export type SalespersonSchema = Omit<Salesperson, "cars" | "id"> & {
  _id: ObjectId;
  dealerID: ObjectId | null;
  carIDs: ObjectId[];
};

export type CarSchema = Omit<Car, "id" | "dealer" | "salespeople"> & {
  _id: ObjectId;
  dealerID: ObjectId | null;
};

export type DealerSchema = Omit<Dealer, "cars" | "salespeople" | "id"> & {
  _id: ObjectId;
};
