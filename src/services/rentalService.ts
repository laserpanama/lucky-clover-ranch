import prisma from '../lib/prisma';

export const getAllRentals = async () => {
  return prisma.rental.findMany({
    include: { animal: true, client: true },
  });
};

export const getRentalById = async (id: number) => {
  return prisma.rental.findUnique({
    where: { id },
    include: { animal: true, client: true },
  });
};

export const createRental = async (data: any) => {
  const startDate: Date = data.startDate;
  const endDate: Date = data.endDate;

  // VALIDATION 1: startDate must be before endDate
  if (startDate >= endDate) {
    throw new Error('Start date must be before end date');
  }

  // VALIDATION 2: Cannot create rentals in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // strip time — critical for midnight comparisons
  if (startDate < today) {
    throw new Error('Cannot create rentals in the past');
  }

  // VALIDATION 3: Animal must exist and not be injured
  const animal = await prisma.animal.findUnique({ where: { id: data.animalId } });
  if (!animal) throw new Error('Animal not found');
  if (animal.status === 'injured') throw new Error('Animal is injured and cannot be rented');

  // VALIDATION 4: No overlapping rentals
  const overlapping = await prisma.rental.findFirst({
    where: {
      animalId: data.animalId,
      status: { not: 'cancelled' },
      OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
    },
  });
  if (overlapping) throw new Error('Animal is already booked for these dates');

  // Determine initial status
  const now = new Date();
  let status = 'pending';
  if (now >= startDate && now <= endDate) status = 'active';
  else if (now > endDate) status = 'completed';

  return prisma.rental.create({ data: { ...data, status } });
};

export const updateRental = async (id: number, data: any) => {
  return prisma.rental.update({ where: { id }, data });
};
