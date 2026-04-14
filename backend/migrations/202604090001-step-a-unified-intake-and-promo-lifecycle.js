async function hasTable(queryInterface, tableName) {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch {
    return false;
  }
}

async function hasColumn(queryInterface, tableName, columnName) {
  const definition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(definition, columnName);
}

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  if (!(await hasColumn(queryInterface, tableName, columnName))) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
}

async function removeColumnIfExists(queryInterface, tableName, columnName) {
  if (await hasColumn(queryInterface, tableName, columnName)) {
    await queryInterface.removeColumn(tableName, columnName);
  }
}

async function indexExists(queryInterface, tableName, indexName) {
  const indexes = await queryInterface.showIndex(tableName);
  return indexes.some((item) => item.name === indexName);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, "students", "source_channel", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "walk_in",
    });

    await addColumnIfMissing(queryInterface, "students", "external_source", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "students", "external_student_ref", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    if (!(await indexExists(queryInterface, "students", "students_external_source_ref_idx"))) {
      await queryInterface.addIndex("students", ["external_source", "external_student_ref"], {
        name: "students_external_source_ref_idx",
      });
    }

    await addColumnIfMissing(queryInterface, "enrollments", "enrollment_channel", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "walk_in",
    });

    await addColumnIfMissing(queryInterface, "enrollments", "external_application_ref", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "enrollments", "promo_package_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "enrollments", "tdc_completion_deadline", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "enrollments", "pdc_eligibility_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "enrollments", "pdc_valid_until", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "enrollments", "pdc_start_mode", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "later",
    });

    await addColumnIfMissing(queryInterface, "enrollments", "enrollment_state", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "active",
    });

    if (!(await indexExists(queryInterface, "enrollments", "enrollments_channel_idx"))) {
      await queryInterface.addIndex("enrollments", ["enrollment_channel"], {
        name: "enrollments_channel_idx",
      });
    }

    if (!(await indexExists(queryInterface, "enrollments", "enrollments_state_idx"))) {
      await queryInterface.addIndex("enrollments", ["enrollment_state"], {
        name: "enrollments_state_idx",
      });
    }

    if (!(await hasTable(queryInterface, "promo_packages"))) {
      await queryInterface.createTable("promo_packages", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        student_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "students", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        enrollment_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "enrollments", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "active",
        },
        purchase_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        tdc_deadline: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        pdc_valid_until: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        allow_extension: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        extension_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      });

      await queryInterface.addIndex("promo_packages", ["student_id"], {
        name: "promo_packages_student_id_idx",
      });
      await queryInterface.addIndex("promo_packages", ["enrollment_id"], {
        name: "promo_packages_enrollment_id_idx",
      });
      await queryInterface.addIndex("promo_packages", ["status"], {
        name: "promo_packages_status_idx",
      });
    }

    if (!(await hasTable(queryInterface, "promo_entitlements"))) {
      await queryInterface.createTable("promo_entitlements", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        promo_package_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "promo_packages", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        module_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "not_started",
        },
        required_sessions: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        completed_sessions: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        started_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        completed_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });

      await queryInterface.addIndex("promo_entitlements", ["promo_package_id"], {
        name: "promo_entitlements_package_id_idx",
      });
      await queryInterface.addIndex("promo_entitlements", ["module_type", "status"], {
        name: "promo_entitlements_module_status_idx",
      });
    }

    if (!(await hasTable(queryInterface, "session_attendance"))) {
      await queryInterface.createTable("session_attendance", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        enrollment_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "enrollments", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        schedule_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "schedules", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        module_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        session_no: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        attendance_status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "present",
        },
        check_in_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        check_out_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        remarks: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      });

      await queryInterface.addIndex("session_attendance", ["enrollment_id"], {
        name: "session_attendance_enrollment_id_idx",
      });
      await queryInterface.addIndex("session_attendance", ["schedule_id"], {
        name: "session_attendance_schedule_id_idx",
      });
      await queryInterface.addIndex("session_attendance", ["module_type", "attendance_status"], {
        name: "session_attendance_module_status_idx",
      });
    }

    if (!(await hasTable(queryInterface, "online_import_queue"))) {
      await queryInterface.createTable("online_import_queue", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        source: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        external_ref: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        raw_payload: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        mapped_payload: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        import_status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "received",
        },
        reviewed_by_user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "Users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        reviewed_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        error_message: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      });

      await queryInterface.addIndex("online_import_queue", ["source", "external_ref"], {
        unique: true,
        name: "online_import_queue_source_external_ref_unique",
      });
      await queryInterface.addIndex("online_import_queue", ["import_status"], {
        name: "online_import_queue_status_idx",
      });
    }

    await queryInterface.addConstraint("enrollments", {
      fields: ["promo_package_id"],
      type: "foreign key",
      name: "enrollments_promo_package_id_fk",
      references: {
        table: "promo_packages",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    }).catch(() => null);
  },

  async down(queryInterface) {
    if (await hasTable(queryInterface, "online_import_queue")) {
      await queryInterface.dropTable("online_import_queue");
    }

    if (await hasTable(queryInterface, "session_attendance")) {
      await queryInterface.dropTable("session_attendance");
    }

    if (await hasTable(queryInterface, "promo_entitlements")) {
      await queryInterface.dropTable("promo_entitlements");
    }

    if (await hasTable(queryInterface, "promo_packages")) {
      await queryInterface.dropTable("promo_packages");
    }

    await queryInterface.removeConstraint("enrollments", "enrollments_promo_package_id_fk").catch(() => null);

    if (await indexExists(queryInterface, "enrollments", "enrollments_state_idx")) {
      await queryInterface.removeIndex("enrollments", "enrollments_state_idx");
    }

    if (await indexExists(queryInterface, "enrollments", "enrollments_channel_idx")) {
      await queryInterface.removeIndex("enrollments", "enrollments_channel_idx");
    }

    await removeColumnIfExists(queryInterface, "enrollments", "enrollment_state");
    await removeColumnIfExists(queryInterface, "enrollments", "pdc_start_mode");
    await removeColumnIfExists(queryInterface, "enrollments", "pdc_valid_until");
    await removeColumnIfExists(queryInterface, "enrollments", "pdc_eligibility_date");
    await removeColumnIfExists(queryInterface, "enrollments", "tdc_completion_deadline");
    await removeColumnIfExists(queryInterface, "enrollments", "promo_package_id");
    await removeColumnIfExists(queryInterface, "enrollments", "external_application_ref");
    await removeColumnIfExists(queryInterface, "enrollments", "enrollment_channel");

    if (await indexExists(queryInterface, "students", "students_external_source_ref_idx")) {
      await queryInterface.removeIndex("students", "students_external_source_ref_idx");
    }

    await removeColumnIfExists(queryInterface, "students", "external_student_ref");
    await removeColumnIfExists(queryInterface, "students", "external_source");
    await removeColumnIfExists(queryInterface, "students", "source_channel");
  },
};
