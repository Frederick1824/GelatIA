const businessService = require("../services/business.service");

async function createBusiness(req, res) {
  await businessService.createBusiness(req.body);
  return res.status(201).json({});
}

module.exports = {
  createBusiness,
};
