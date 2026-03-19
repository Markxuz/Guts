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

async function updatePassword(userId, password_hash) {
  await User.update({ password_hash, must_change_password: false }, { where: { id: userId } });
  return findUserById(userId);
}

async function updateMustChangePassword(userId, mustChangePassword) {
  await User.update({ must_change_password: Boolean(mustChangePassword) }, { where: { id: userId } });
  return findUserById(userId);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updatePassword,
  updateMustChangePassword,
};
