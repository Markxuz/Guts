const { OnlineImportQueue, Student } = require("../../../models");

async function listQueue({ source, status, limit = 100 } = {}) {
  const where = {};
  if (source) where.source = source;
  if (status) where.import_status = status;

  return OnlineImportQueue.findAll({
    where,
    order: [["id", "DESC"]],
    limit,
  });
}

async function findQueueById(id, transaction) {
  return OnlineImportQueue.findByPk(id, { transaction });
}

async function findQueueBySourceAndRef(source, externalRef, transaction) {
  return OnlineImportQueue.findOne({
    where: {
      source,
      external_ref: externalRef,
    },
    transaction,
  });
}

async function createQueue(payload, transaction) {
  return OnlineImportQueue.create(payload, { transaction });
}

async function updateQueue(queueItem, payload, transaction) {
  return queueItem.update(payload, transaction ? { transaction } : undefined);
}

async function findStudentById(id, transaction) {
  return Student.findByPk(id, { transaction });
}

async function updateStudent(student, payload, transaction) {
  return student.update(payload, transaction ? { transaction } : undefined);
}

module.exports = {
  listQueue,
  findQueueById,
  findQueueBySourceAndRef,
  createQueue,
  updateQueue,
  findStudentById,
  updateStudent,
};
