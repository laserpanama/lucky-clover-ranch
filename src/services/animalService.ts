import prisma from '../lib/prisma';

export const animalService = {
  getAll: async () => {
    return prisma.animal.findMany();
  },

  getById: async (id: number) => {
    return prisma.animal.findUnique({ where: { id } });
  },

  create: async (data: any) => {
    return prisma.animal.create({ data });
  },

  update: async (id: number, data: any) => {
    return prisma.animal.update({ where: { id }, data });
  },

  delete: async (id: number) => {
    // Safe delete: reject if any rentals reference this animal
    const rentalCount = await prisma.rental.count({ where: { animalId: id } });
    if (rentalCount > 0) {
      throw new Error('Cannot delete animal with rental history.');
    }
    return prisma.animal.delete({ where: { id } });
  },

  getWithAvailability: async () => {
    const animals = await prisma.animal.findMany({
      include: {
        rentals: {
          where: {
            OR: [
              { status: 'active' },
              { status: 'upcoming' },
            ],
          },
        },
      },
    });

    const now = new Date();

    return animals.map((animal) => {
      const activeRental = animal.rentals.find((r) => r.status === 'active');
      return {
        id: animal.id,
        name: animal.name,
        tagNumber: animal.tagNumber,
        breed: animal.breed,
        status: animal.status,
        category: animal.category,
        isAvailable: !activeRental && animal.status !== 'injured',
      };
    });
  },
};
