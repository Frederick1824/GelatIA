const { BadRequestError } = require("../lib/errors");

function getBusinessCreationMessage() {
  return "POST /business esta deprecado. Usa POST /auth/register como flujo oficial de onboarding.";
}

async function createBusiness() {
  throw new BadRequestError(getBusinessCreationMessage());
}

module.exports = {
  createBusiness,
  getBusinessCreationMessage,
};
