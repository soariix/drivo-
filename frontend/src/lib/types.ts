export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  renavam: string;
  chassis: string;
  brand: string;
  model: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
  fuel: string;
  type: string;
  nickname: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInput {
  plate: string;
  renavam: string;
  chassis: string;
  brand: string;
  model: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
  fuel: string;
  type: string;
  nickname: string;
}