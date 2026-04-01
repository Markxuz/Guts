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
    if (!(await hasTable(queryInterface, "NotificationReads"))) {
      await queryInterface.createTable("NotificationReads", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        notification_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "Notifications", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "Users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        read_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });

      await queryInterface.addIndex("NotificationReads", ["notification_id", "user_id"], {
        unique: true,
        name: "notification_reads_unique_notification_user",
      });
      await queryInterface.addIndex("NotificationReads", ["user_id"], {
        name: "notification_reads_user_id_idx",
      });
    }
  },

  async down(queryInterface) {
    if (await hasTable(queryInterface, "NotificationReads")) {
      await queryInterface.dropTable("NotificationReads");
    }
  },
};
