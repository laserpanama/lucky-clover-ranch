import prisma from '../lib/prisma';

export const getAllAnimals = async () => {
  return prisma.animal.findMany({
    include: { healthRecords: true, rentals: true },
  });
};

export const getAnimalById = async (id: number) => {
  return prisma.animal.findUnique({
    where: { id },
    include: { healthRecords: true, rentals: true },
  });
};

export const createAnimal = async (data: any) => {
  return prisma.animal.create({ data });
};

export const updateAnimal = async (id: number, data: any) => {
  return prisma.animal.update({
    where: { id },
    data,
  });
};

export const deleteAnimal = async (id: number) => {
  return prisma.animal.delete({
    where: { id },
  });
};

export const getAnimalsWithAvailability = async () => {
  const animals = await prisma.animal.findMany({
    include: {
      rentals: true,
    },
  });

  const today = new Date();

  return animals.map((animal) => {
    const activeRental = animal.rentals.find(
      (r) =>
        new Date(r.startDate) <= today &&
        new Date(r.endDate) >= today
    );

    const futureRentals = animal.rentals
      .filter((r) => new Date(r.startDate) > today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return {
      ...animal,
      isAvailable: !activeRental,
      currentRental: activeRental || null,
      nextRental: futureRentals[0] || null,
    };
  });
};