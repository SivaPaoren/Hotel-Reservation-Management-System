import { api } from "./client";

export interface Customer {
  _id: string;
  name: string;
  email: string;
  age: number;
  password: string; // returned by your current backend; okay for this exercise
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  age: number;
  password: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  age?: number;
  password?: string;
}

export async function listCustomers(): Promise<Customer[]> {
  const { data } = await api.get<Customer[]>("/api/customers");
  return data;
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await api.get<Customer>(`/api/customers/${id}`);
  return data;
}

export async function createCustomer(body: CreateCustomerInput): Promise<Customer> {
  const { data } = await api.post<Customer>("/api/customers", body);
  return data;
}

export async function updateCustomer(id: string, patch: UpdateCustomerInput): Promise<Customer> {
  const { data } = await api.put<Customer>(`/api/customers/${id}`, patch);
  return data;
}

export async function deleteCustomer(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/api/customers/${id}`);
  return data;
}
