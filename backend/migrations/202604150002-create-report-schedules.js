async function hasTable(queryInterface, tableName) {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (await hasTable(queryInterface, "report_schedules")) {
      return;
    }

    await queryInterface.createTable("report_schedules", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      recipients: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      frequency: {
        type: Sequelize.ENUM("daily", "weekly", "monthly"),
        allowNull: false,
      },
      file_format: {
        type: Sequelize.ENUM("csv", "excel", "pdf"),
        allowNull: false,
      },
      course: {
        type: Sequelize.ENUM("overall", "tdc", "pdc", "pdc_beginner", "pdc_experience"),
        allowNull: false,
        defaultValue: "overall",
      },
      created_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      next_run_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      last_sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      status: {
        type: Sequelize.ENUM("scheduled", "paused", "completed"),
        allowNull: false,
        defaultValue: "scheduled",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("report_schedules", ["created_by_user_id"], {
      name: "report_schedules_created_by_user_id_idx",
    });

    await queryInterface.addIndex("report_schedules", ["next_run_at", "is_active"], {
      name: "report_schedules_next_run_active_idx",
    });
  },

  async down(queryInterface) {
    if (await hasTable(queryInterface, "report_schedules")) {
      await queryInterface.dropTable("report_schedules");
    }
  },
};