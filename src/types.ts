export interface Animal {
  id: number;
  tagNumber: string;
  name: string;
  breed: string;
  status: string;
  dateOfBirth: string;
  notes?: string;
  category: string;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  organization?: string;
}

export interface Rental {
  id: number;
  animalId: number;
  clientId: number;
  startDate: string;
  endDate: string;
  status: string;
  price: number;
  animal: Animal;
  client: Client;
}

export type Tab = "dashboard" | "animals" | "clients" | "rentals" | "calendar";
