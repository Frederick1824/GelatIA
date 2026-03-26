const prisma = require("../config/prisma");
const { BadRequestError, NotFoundError } = require("../lib/errors");
const { parsePositiveInt, parseNonNegativeInt } = require("../lib/validation");

async function updateBranchFlavor(auth, payload) {
  const id = parsePositiveInt(payload?.id);
  const stockGrams = parseNonNegativeInt(payload?.stockGrams);
  const requestedIsActive = payload?.isActive;

  if (!id || stockGrams === null) {
    throw new BadRequestError("id y stockGrams validos son obligatorios");
  }

  if (requestedIsActive !== undefined && typeof requestedIsActive !== "boolean") {
    throw new BadRequestError("isActive debe ser booleano");
  }

  const branchFlavor = await prisma.branchFlavor.findUnique({
    where: { id },
    include: {
      branch: true,
    },
  });

  if (!branchFlavor || branchFlavor.branch.businessId !== auth?.businessId) {
    throw new NotFoundError("Relacion branchFlavor no encontrada");
  }

  return prisma.branchFlavor.update({
    where: { id },
    data: {
      stockGrams,
      isActive: requestedIsActive ?? stockGrams > 0,
    },
  });
}

module.exports = {
  updateBranchFlavor,
};
