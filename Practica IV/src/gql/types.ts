import {gql} from "graphql_tag";

export const typeDefs = gql`
    type Mutation {
        createCar(
            model: String!,
            price: Int!,
            licensePlate: String!,
            salespeopleIDs: [String!],
            dealerID: String,
        ): Car
        createDealer(address: String!, location: String!): Dealer
        createSalesperson(name: String!, dealerID: String): Salesperson
        addCarToSalesperson(salespersonID: String!, carID: String!): Salesperson
        addSalespersonToDealer(dealerID: String!, salespersonID: String!): Salesperson
    }
    type Query {
        getCars(
            id: String,
            licensePlate: String,
            model: String,
            price: Int,
            maxPrice: Int,
            minPrice: Int,
        ): [Car!]!
        getSalespeople(id: String, name: String): [Salesperson!]!
        getDealers(
          id: String,
          address: String,
          location: String,
          first: Int=10,
          after: Int=0,
        ): [Dealer!]!
    }
    type Car {
        id: String!
        model: String!
        price: Int!
        salespeople: [Salesperson!]!
        dealer: Dealer
    }
    type Salesperson {
        id: String!
        name: String!
        cars: [Car!]!
        dealer: Dealer
    }
    type Dealer {
        id: String!
        address: String!
        location: String!
        cars: [Car!]!
        salespeople: [Salesperson!]!
    }
`;
