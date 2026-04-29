const { sequelize, User } = require("../../../models");

let userAttributesWithSessionVersion = null;

async function getUserAttributes() {
  if (Array.isArray(userAttributesWithSessionVersion)) {
    return userAttributesWithSessionVersion;
  }

  const baseAttributes = ["id", "name", "email", "password_hash", "role", "must_change_password"];

  try {
    const definition = await sequelize.getQueryInterface().describeTable("Users");
    if (Object.prototype.hasOwnProperty.call(definition, "session_version")) {
      userAttributesWithSessionVersion = [...baseAttributes, "session_version"];
      return userAttributesWithSessionVersion;
    }
  } catch {
    // Fall through to the legacy column set when the table is older.
  }

  userAttributesWithSessionVersion = baseAttributes;
  return userAttributesWithSessionVersion;
}

async function findUserByEmail(email) {
  return User.findOne({ where: { email }, attributes: await getUserAttributes() });
}

async function findUserById(id) {
  return User.findByPk(id, { attributes: await getUserAttributes() });
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

async function updateSessionVersion(userId, sessionVersion) {
  try {
    const attributes = await getUserAttributes();
    if (!attributes.includes("session_version")) {
      return findUserById(userId);
    }

    await User.update({ session_version: sessionVersion }, { where: { id: userId } });
    return findUserById(userId);
  } catch {
    return findUserById(userId);
  }
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updatePassword,
  updateMustChangePassword,
  updateSessionVersion,
};
