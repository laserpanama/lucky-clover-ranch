import prisma from '../lib/prisma';

// Derive status from dates, single source of truth
function deriveStatus(startDate: Date, endDate: Date): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(startDate); start.setHours(0, 0, 0, 0);
  const end = new Date(endDate); end.setHours(23, 59, 59, 999);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'active';
  return 'completed';
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
  const startDate: Date = data.startDate;
  const endDate: Date = data.endDate;

  // 1. Date order
  if (startDate >= endDate) {
    throw new Error('Start date must be before end date');
  }

  // 2. Past rentals guard
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDate < today) {
    throw new Error('Cannot create rentals in the past');
  }

  // 3. Animal must exist
  const animal = await prisma.animal.findUnique({ where: { id: data.animalId } });
  if (!animal) throw new Error('Animal not found');

  // 4. Only rodeo animals can be rented
  if (animal.category !== 'rodeo') {
    throw new Error('Only rodeo animals can be rented.');
  }

  // 5. Injured animals cannot be rented
  if (animal.status === 'injured') {
    throw new Error('Injured animals cannot be rented.');
  }

  // 6. No overlapping rentals for this animal
  const overlapping = await prisma.rental.findFirst({
    where: {
      animalId: data.animalId,
      status: { not: 'cancelled' },
      AND: [
        { startDate: { lte: endDate } },
        { endDate: { gte: startDate } },
      ],
    },
  });
  if (overlapping) throw new Error('Animal is already booked for those dates.');

  const status = deriveStatus(startDate, endDate);
  return prisma.rental.create({ data: { ...data, status } });
};

export const updateRental = async (id: number, data: any) => {
  // Fetch current rental to fill missing fields
  const existing = await prisma.rental.findUnique({ where: { id } });
  if (!existing) throw new Error('Rental not found');

  const startDate: Date = data.startDate ?? existing.startDate;
  const endDate: Date = data.endDate ?? existing.endDate;
  const animalId: number = data.animalId ?? existing.animalId;

  if (startDate >= endDate) {
    throw new Error('Start date must be before end date');
  }

  // Re-validate animal if changed
  if (data.animalId && data.animalId !== existing.animalId) {
    const animal = await prisma.animal.findUnique({ where: { id: animalId } });
    if (!animal) throw new Error('Animal not found');
    if (animal.category !== 'rodeo') throw new Error('Only rodeo animals can be rented.');
    if (animal.status === 'injured') throw new Error('Injured animals cannot be rented.');
  }

  // Overlap check — exclude self
  const overlapping = await prisma.rental.findFirst({
    where: {
      animalId,
      id: { not: id },
      status: { not: 'cancelled' },
      AND: [
        { startDate: { lte: endDate } },
        { endDate: { gte: startDate } },
      ],
    },
  });
  if (overlapping) throw new Error('Animal is already booked for those dates.');

  const status = deriveStatus(startDate, endDate);
  return prisma.rental.update({ where: { id }, data: { ...data, status } });
};

export const deleteRental = async (id: number) => {
  return prisma.rental.delete({ where: { id } });
};
