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
  // Safe delete: reject if client has any rental history
  const rentalCount = await prisma.rental.count({ where: { clientId: id } });
  if (rentalCount > 0) {
    throw new Error('Cannot delete client with rental history.');
  }
  return prisma.client.delete({ where: { id } });
};
