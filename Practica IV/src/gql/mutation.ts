import { InsertDocument, ObjectId } from "mongo";
import {
  CarsCollection,
  DealersCollection,
  SalespeopleCollection,
} from "../db/dbconnection.ts";
import { CarSchema, DealerSchema, SalespersonSchema } from "../db/schema.ts";
import { Car, Dealer, Salesperson } from "../types.ts";
import {
  formatError,
  nameValidator,
  objectIdValidation,
} from "../validation/validation.ts";
import { z } from "zod";

const createDealerArgValidation = z.object({
  address: z.string().min(2),
  location: z.string().min(2),
});

export const createDealer = async (
  _: unknown,
  arg: { address: string; location: string }
): Promise<Dealer> => {
  try {
    createDealerArgValidation.parse(arg);
  } catch (e) {
    throw new Error(formatError(e));
  }

  const dealerInsertDoc: InsertDocument<DealerSchema> = {
    address: arg.address,
    location: arg.location,
  };
  await DealersCollection.insertOne(dealerInsertDoc);
  return {
    address: dealerInsertDoc.address,
    location: dealerInsertDoc.location,
    id: dealerInsertDoc._id!.toString(),
  };
};

const createCarArgValidation = z.object({
  model: z.string().min(2),
  price: z.number().nonnegative(),
  licensePlate: z.string().min(2),
  salespeopleIDs: z.array(objectIdValidation).optional(),
  dealerID: objectIdValidation.optional(),
});

export const createCar = async (
  _: unknown,
  arg: {
    model: string;
    price: number;
    licensePlate: string;
    salespeopleIDs?: string[];
    dealerID?: string;
  }
): Promise<Car> => {
  try {
    createCarArgValidation.parse(arg);
  } catch (e) {
    throw new Error(formatError(e));
  }
  const { salespeopleIDs, dealerID, licensePlate, price, model } = arg;

  if (salespeopleIDs && salespeopleIDs.length !== 0) {
    const c = await SalespeopleCollection.countDocuments({
      _id: { $in: salespeopleIDs.map((id) => new ObjectId(id)) },
    });
    if (c !== salespeopleIDs.length) {
      throw new Error("A salesperson was not found");
    }
  }
  if (dealerID) {
    const c = await DealersCollection.countDocuments({
      _id: new ObjectId(dealerID),
    });
    if (c !== 1) {
      throw new Error("Dealer not found");
    }
  }

  const carInsertDoc: InsertDocument<CarSchema> = {
    licensePlate,
    price,
    model,
    dealerID: new ObjectId(dealerID),
  };
  await CarsCollection.insertOne(carInsertDoc);
  if (salespeopleIDs && salespeopleIDs.length > 0) {
    await SalespeopleCollection.updateMany(
      { _id: { $in: salespeopleIDs.map((id) => new ObjectId(id)) } },
      { $push: { carIDs: new ObjectId(carInsertDoc._id) } as any }
    );
  }

  return {
    id: carInsertDoc._id!.toString(),
    licensePlate: carInsertDoc.licensePlate,
    model: carInsertDoc.model,
    price: carInsertDoc.price,
  };
};

const createSalespersonArgValidation = z.object({
  name: nameValidator,
  dealerID: objectIdValidation.optional(),
});

export const createSalesperson = async (
  _: unknown,
  arg: { name: string; dealerID?: string }
): Promise<Salesperson> => {
  try {
    createSalespersonArgValidation.parse(arg);
  } catch (e) {
    throw new Error(formatError(e));
  }
  const { name, dealerID } = arg;
  const salespersonInsertDoc: InsertDocument<SalespersonSchema> = {
    name,
    dealerID: dealerID ? new ObjectId(dealerID) : null,
    carIDs: [],
  };
  if (dealerID) {
    const n = await DealersCollection.countDocuments({
      _id: new ObjectId(dealerID),
    });
    if (n === 0) {
      throw new Error("Dealer not found");
    }
  }
  await SalespeopleCollection.insertOne(salespersonInsertDoc);

  return {
    id: salespersonInsertDoc._id!.toString(),
    name: salespersonInsertDoc.name,
  };
};

const addSalespersonToDealerArgValidation = z.object({
  dealerID: objectIdValidation,
  salespersonID: objectIdValidation,
});

export const addSalespersonToDealer = async (
  _: unknown,
  arg: { dealerID: string; salespersonID: string }
): Promise<Salesperson> => {
  try {
    addSalespersonToDealerArgValidation.parse(arg);
  } catch (e) {
    throw new Error(formatError(e));
  }
  const { dealerID, salespersonID } = arg;
  const salespersonDoc = await SalespeopleCollection.findOne({
    _id: new ObjectId(salespersonID),
  });
  const c = await DealersCollection.countDocuments({
    _id: new ObjectId(dealerID),
  });
  if (salespersonDoc === undefined) {
    throw new Error("salesperson not found");
  }
  if (c === 0) {
    throw new Error("dealer not found");
  }
  await SalespeopleCollection.updateOne(
    { _id: new ObjectId(salespersonID) },
    {
      $set: { dealerID: new ObjectId(dealerID) },
    }
  );
  return {
    id: salespersonDoc._id.toString(),
    name: salespersonDoc.name,
  };
};

const addCarToSalespersonArgValidation = z.object({
  salespersonID: objectIdValidation,
  carID: objectIdValidation,
});

export const addCarToSalesperson = async (
  _: unknown,
  arg: { salespersonID: string; carID: string }
): Promise<Salesperson> => {
  try {
    addCarToSalespersonArgValidation.parse(arg);
  } catch (e) {
    throw new Error(formatError(e));
  }
  const { salespersonID, carID } = arg;
  const salespersonDoc = await SalespeopleCollection.findOne({
    _id: new ObjectId(salespersonID),
  });
  if (salespersonDoc === undefined) {
    throw new Error("salesperson not found");
  }
  const c = await CarsCollection.countDocuments({ _id: new ObjectId(carID) });
  if (c === 0) {
    throw new Error("car not found");
  }
  await SalespeopleCollection.updateOne(
    { _id: new ObjectId(salespersonID) },
    {
      $push: { carIDs: new ObjectId(carID) } as any,
    }
  );
  return {
    id: salespersonDoc._id.toString(),
    name: salespersonDoc.name,
  };
};
