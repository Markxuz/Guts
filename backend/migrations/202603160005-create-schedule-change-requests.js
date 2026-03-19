module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const normalizedTables = tables.map((item) => (typeof item === "string" ? item : item.tableName || item.TABLE_NAME));

    if (normalizedTables.includes("schedule_change_requests")) {
      return;
    }

    await queryInterface.createTable("schedule_change_requests", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "schedules",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      enrollment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "enrollments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      requested_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reviewed_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      requested_schedule_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      requested_slot: {
        type: Sequelize.ENUM("morning", "afternoon"),
        allowNull: false,
      },
      request_scope: {
        type: Sequelize.ENUM("single", "both"),
        allowNull: false,
        defaultValue: "single",
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      reviewer_note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const normalizedTables = tables.map((item) => (typeof item === "string" ? item : item.tableName || item.TABLE_NAME));

    if (normalizedTables.includes("schedule_change_requests")) {
      await queryInterface.dropTable("schedule_change_requests");
    }
  },
};