import prisma from '../lib/prisma';

export const getAllClients = async () => {
  return prisma.client.findMany({
    include: { rentals: true },
  });
};

export const getClientById = async (id: number) => {
  return prisma.client.findUnique({
    where: { id },
    include: { rentals: true },
  });
};

export const createClient = async (data: any) => {
  return prisma.client.create({ data });
};

export const updateClient = async (id: number, data: any) => {
  return prisma.client.update({
    where: { id },
    data,
  });
};

export const deleteClient = async (id: number) => {
  return prisma.client.delete({
    where: { id },
  });
};
