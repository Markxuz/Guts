"use strict";

async function hasTable(queryInterface, tableName) {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch {
    return false;
  }
}

async function hasColumn(queryInterface, tableName, columnName) {
  if (!(await hasTable(queryInterface, tableName))) {
    return false;
  }

  const definition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(definition, columnName);
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (!(await hasTable(queryInterface, "QRCodes"))) {
      await queryInterface.createTable("QRCodes", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        token: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        template: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        createdBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "Users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        revoked: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }

    if (!(await hasColumn(queryInterface, "Enrollments", "qrCodeId"))) {
      await queryInterface.addColumn("Enrollments", "qrCodeId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "QRCodes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  down: async (queryInterface) => {
    if (await hasColumn(queryInterface, "Enrollments", "qrCodeId")) {
      await queryInterface.removeColumn("Enrollments", "qrCodeId");
    }

    if (await hasTable(queryInterface, "QRCodes")) {
      await queryInterface.dropTable("QRCodes");
    }
  },
};
