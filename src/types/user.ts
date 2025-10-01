export type Address = {
  id: string;
  label: string;
  street: string;
  city: string;
  country: string;
  postal: string;
};

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type Payment = {
  id: string;
  amount: number;
  method: string;
  status: string;
  processedAt: string;
};

export type Order = {
  id: string;
  number: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  payments: Payment[];
};

export type LoyaltyEntry = {
  id: string;
  points: number;
  reason: string;
  createdAt: string;
};

export type Subscription = {
  id: string;
  plan: string;
  status: string;
  createdAt: string;
};

export type UserWithRelations = {
  id: string;
  email: string;
  name: string | null;
  role?: "USER" | "ADMIN";
  addresses: Address[];
  orders: Order[];
  loyalty: LoyaltyEntry[];
  subscriptions: Subscription[];
};

export type AddressInput = Omit<Address, "id"> & {id?: string};

export type UserRegistrationPayload = {
  email: string;
  name?: string;
  password: string;
  addresses?: AddressInput[];
};

export type UserUpdatePayload = {
  email?: string;
  name?: string | null;
  password?: string;
  addresses?: AddressInput[];
};

export type UserLoginPayload = {
  email: string;
  password: string;
};
