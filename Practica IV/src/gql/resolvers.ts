import { carChain, dealerChain, salespersonChain } from "./chain.ts";
import {
  addCarToSalesperson,
  addSalespersonToDealer,
  createCar,
  createDealer,
  createSalesperson,
} from "./mutation.ts";
import { getCars, getDealers, getSalespeople } from "./query.ts";

export const resolvers = {
  Query: {
    getCars: getCars,
    getSalespeople: getSalespeople,
    getDealers: getDealers,
  },
  Mutation: {
    createDealer: createDealer,
    createCar: createCar,
    createSalesperson: createSalesperson,
    addSalespersonToDealer: addSalespersonToDealer,
    addCarToSalesperson: addCarToSalesperson,
  },
  Dealer: dealerChain,
  Salesperson: salespersonChain,
  Car: carChain,
};
