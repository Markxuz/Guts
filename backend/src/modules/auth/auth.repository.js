const { User } = require("../../../models");

async function findUserByEmail(email) {
  return User.findOne({ where: { email } });
}

async function findUserById(id) {
  return User.findByPk(id);
}

async function createUser(payload) {
  return User.create(payload);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
};
