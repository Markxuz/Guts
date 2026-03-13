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
    // 1. Expand Users.role ENUM to include sub_admin
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.ENUM("admin", "sub_admin", "staff", "instructor"),
      allowNull: false,
      defaultValue: "staff",
    });

    // 2. Create Notifications table
    if (!(await hasTable(queryInterface, "Notifications"))) {
      await queryInterface.createTable("Notifications", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        is_read: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        actor_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "Users", key: "id" },
          onDelete: "SET NULL",
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });
    }
  },
};
