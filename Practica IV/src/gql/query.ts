import { ObjectId } from "mongo";
import { pickBy, pick } from "lodash";
import {
  CarsCollection,
  DealersCollection,
  SalespeopleCollection,
} from "../db/dbconnection.ts";
import { Car, Dealer, Salesperson } from "../types.ts";
import { z } from "zod";
import {
  formatError,
  nameValidator,
  objectIdValidation,
} from "../validation/validation.ts";

const getCarsArgValidation = z.object({
  id: objectIdValidation.optional(),
  licensePlate: z.string().min(2).optional(),
  model: z.string().min(2).optional(),
  price: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  minPrice: z.number().nonnegative().optional(),
});

export const getCars = async (
  _: unknown,
  arg: {
    id?: string;
    licensePlate?: string;
    model?: string;
    price?: number;
    maxPrice?: number;
    minPrice?: number;
  }
): Promise<Car[]> => {
  try {
    getCarsArgValidation.parse(arg);
  } catch (e) {
    throw new Error(formatError(e));
  }

  let clauses: any = pick(arg, "licensePlate", "model", "price");
  clauses = pickBy(clauses, (v: any) => v !== undefined);

  if (arg.id !== undefined) {
    clauses._id = new ObjectId(arg.id);
  }

  if (
    arg.price === undefined &&
    (arg.maxPrice !== undefined || arg.minPrice !== undefined)
  ) {
    const priceClause: any = {};
    if (arg.minPrice !== undefined) {
      priceClause["$gte"] = arg.minPrice;
    }
    if (arg.maxPrice !== undefined) {
      priceClause["$lte"] = arg.maxPrice;
    }
    if (Object.keys(priceClause).length !== 0) {
      clauses.price = priceClause;
    }
  }

  const carDocs = await CarsCollection.find(clauses);
  return carDocs.map((doc) => {
    return { ...doc, id: doc._id.toString() };
  });
};

const getSalespeopleArgValidation = z.object({
  id: objectIdValidation.optional(),
  name: nameValidator.optional(),
});

export const getSalespeople = async (
  _: unknown,
  arg: {
    id?: string;
    name?: string;
  }
): Promise<Salesperson[]> => {
  try {
    getSalespeopleArgValidation.parse(arg);
  } catch (e) {
    throw new Error(formatError(e));
  }
  const clauses: any = pickBy(arg, (v: any) => v !== undefined);
  const salespeopleDocs = await SalespeopleCollection.find(clauses);
  return salespeopleDocs.map((doc) => {
    return { ...doc, id: doc._id.toString() };
  });
};

const getDealersArgValidation = z.object({
  id: objectIdValidation.optional(),
  location: z.string().min(2).optional(),
  address: z.string().min(2).optional(),
  first: z.number().positive(),
  after: z.number().nonnegative(),
});

export const getDealers = async (
  _: unknown,
  arg: {
    id?: string;
    location?: string;
    address?: string;
    first: number;
    after: number;
  }
): Promise<Dealer[]> => {
  let parsedArg: any;
  try {
    parsedArg = getDealersArgValidation.parse(arg);
  } catch (e) {
    throw new Error(formatError(e));
  }

  let clauses = (({ location, address, id }: any) => {
    return {
      location,
      address,
      _id: id,
    };
  })(parsedArg);
  clauses = pickBy(arg, (v: any) => v !== undefined);

  const dealersDocs = await DealersCollection.find(clauses)
    .skip(parsedArg.after)
    .limit(parsedArg.first)
    .toArray();
  return dealersDocs.map((doc) => {
    return { ...doc, id: doc._id.toString() };
  });
};
