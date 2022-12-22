import { ObjectId } from "mongo";
import {
  CarsCollection,
  DealersCollection,
  SalespeopleCollection,
} from "../db/dbconnection.ts";
import { Car, Dealer, Salesperson } from "../types.ts";

export const dealerChain = {
  cars: async (parent: Dealer): Promise<Car[]> => {
    const carDocs = await CarsCollection.find({
      dealerID: new ObjectId(parent.id),
    }).toArray();
    return carDocs.map((doc: any) => {
      return { ...doc, id: doc._id.toString() };
    });
  },

  salespeople: async (parent: Dealer): Promise<Salesperson[]> => {
    const salespeopleDocs = await SalespeopleCollection.find({
      dealerID: new ObjectId(parent.id),
    }).toArray();
    return salespeopleDocs.map((doc: any) => {
      return { ...doc, id: doc._id.toString() };
    });
  },
};

export const salespersonChain = {
  cars: async (parent: Salesperson): Promise<Car[]> => {
    const salespersonDoc = await SalespeopleCollection.findOne({
      _id: new ObjectId(parent.id),
    });
    const carDocs = await CarsCollection.find({
      _id: { $in: salespersonDoc!.carIDs },
    }).toArray();
    for (const doc of carDocs as any) {
      doc.id = doc._id;
      delete doc._id;
      delete doc.salespeopleIDs;
      delete doc.dealerID;
    }
    return carDocs as any;
  },
  dealer: async (parent: Salesperson): Promise<Dealer | null> => {
    const { dealerID } = (await SalespeopleCollection.findOne(
      { _id: new ObjectId(parent.id) },
      {
        projection: { _id: false, dealerID: true },
      }
    ))!;
    if (!dealerID) {
      return null;
    }
    const dealerDoc = await DealersCollection.findOne({ _id: dealerID });
    if (dealerDoc === undefined) {
      return null;
    }
    return {
      ...dealerDoc,
      id: dealerDoc._id.toString(),
    };
  },
};

export const carChain = {
  salespeople: async (parent: Car): Promise<Salesperson[]> => {
    const salespeopleDocs = await SalespeopleCollection.find({
      carIDs: { $all: [new ObjectId(parent.id)] },
    }).toArray();
    return salespeopleDocs.map((doc) => {
      return {
        ...doc,
        id: doc._id.toString(),
      };
    });
  },

  dealer: async (parent: Car): Promise<Dealer | null> => {
    const carDoc = await CarsCollection.findOne({
      _id: new ObjectId(parent.id),
    });
    if (carDoc!.dealerID === null) {
      return null;
    }
    const doc = await DealersCollection.findOne({
      _id: carDoc!.dealerID,
    });
    return doc === undefined
      ? null
      : {
          ...doc,
          id: doc._id.toString(),
        };
  },
};
