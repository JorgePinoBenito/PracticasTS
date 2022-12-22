export type Car = {
  id: string;
  price: number;
  model: string;
  licensePlate: string;
  salespeople?: Salesperson[];
  dealer?: Dealer | null;
};

export type Dealer = {
  id: string;
  address: string;
  location: string;
  salespeople?: Salesperson[];
  cars?: Car[];
};

export type Salesperson = {
  id: string;
  name: string;
  cars?: Car[];
  dealer?: Dealer | null;
};
