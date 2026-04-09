import prisma from '../lib/prisma';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function deriveStatus(startDate: Date, endDate: Date) {
  const today = startOfDay(new Date());
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);

  if (today < start) return 'upcoming';
  if (today > end) return 'completed';
  return 'active';
}

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
  const startDate: Date = new Date(data.startDate);
  const endDate: Date = new Date(data.endDate);

  if (startDate >= endDate) {
    throw new Error('Start date must be before end date');
  }

  const today = startOfDay(new Date());
  if (startOfDay(startDate) < today) {
    throw new Error('Cannot create rentals in the past');
  }

  const animal = await prisma.animal.findUnique({
    where: { id: data.animalId },
  });

  if (!animal) throw new Error('Animal not found');
  if (animal.status === 'injured') {
    throw new Error('Animal is injured and cannot be rented');
  }
  if (animal.category !== 'rodeo') {
    throw new Error('Only rodeo animals can be rented');
  }

  const overlapping = await prisma.rental.findFirst({
    where: {
      animalId: data.animalId,
      status: { not: 'cancelled' },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });

  if (overlapping) {
    throw new Error('Animal is already booked for these dates');
  }

  const status = deriveStatus(startDate, endDate);

  return prisma.rental.create({
    data: {
      ...data,
      startDate,
      endDate,
      status,
    },
  });
};

export const updateRental = async (id: number, data: any) => {
  const existing = await prisma.rental.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Rental not found');
  }

  const startDate = data.startDate ? new Date(data.startDate) : existing.startDate;
  const endDate = data.endDate ? new Date(data.endDate) : existing.endDate;
  const animalId = data.animalId ?? existing.animalId;

  if (startDate >= endDate) {
    throw new Error('Start date must be before end date');
  }

  const animal = await prisma.animal.findUnique({
    where: { id: animalId },
  });

  if (!animal) throw new Error('Animal not found');
  if (animal.status === 'injured') {
    throw new Error('Animal is injured and cannot be rented');
  }
  if (animal.category !== 'rodeo') {
    throw new Error('Only rodeo animals can be rented');
  }

  const overlapping = await prisma.rental.findFirst({
    where: {
      id: { not: id },
      animalId,
      status: { not: 'cancelled' },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });

  if (overlapping) {
    throw new Error('Animal is already booked for these dates');
  }

  const status = deriveStatus(startDate, endDate);

  return prisma.rental.update({
    where: { id },
    data: {
      ...data,
      startDate,
      endDate,
      animalId,
      status,
    },
  });
};

export const deleteRental = async (id: number) => {
  return prisma.rental.delete({
    where: { id },
  });
};
