const { DataTypes } = require("sequelize");

function normalizeAssignedVehicleIds(value) {
	if (Array.isArray(value)) {
		return Array.from(
			new Set(
				value
					.map((item) => Number(item))
					.filter((item) => Number.isInteger(item) && item > 0)
			)
		);
	}

	if (typeof value === "string") {
		const trimmed = value.trim();
		if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
			try {
				const parsed = JSON.parse(trimmed);
				return normalizeAssignedVehicleIds(parsed);
			} catch (error) {
				return [];
			}
		}

		return Array.from(
			new Set(
				value
					.split(",")
					.map((item) => Number(String(item).trim()))
					.filter((item) => Number.isInteger(item) && item > 0)
			)
		);
	}

	if (typeof value === "number" && Number.isInteger(value) && value > 0) {
		return [value];
	}

	return [];
}

module.exports = (sequelize) => {
	const Instructor = sequelize.define("Instructor", {
		name: {
			type: DataTypes.STRING(100),
			allowNull: true,
		},
		license_number: {
			type: DataTypes.STRING(50),
			allowNull: true,
		},
		specialization: {
			type: DataTypes.STRING(50),
			allowNull: true,
		},
		status: {
			type: DataTypes.STRING(30),
			allowNull: true,
			defaultValue: "Active",
			validate: {
				isIn: [["Active", "On Leave"]],
			},
		},
		assigned_vehicle_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		assigned_vehicle_ids: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		tdc_cert_expiry: {
			type: DataTypes.DATEONLY,
			allowNull: true,
		},
		pdc_cert_expiry: {
			type: DataTypes.DATEONLY,
			allowNull: true,
		},
		certification_file_name: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		tdc_certified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		pdc_beginner_certified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		pdc_experience_certified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		phone: {
			type: DataTypes.STRING(20),
			allowNull: true,
			validate: {
				len: [0, 20],
			},
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	}, {
		hooks: {
			beforeValidate: (instructor) => {
				const assignedVehicleIdsChanged = typeof instructor.changed === "function"
					? instructor.changed("assigned_vehicle_ids")
					: false;
				const assignedVehicleIdChanged = typeof instructor.changed === "function"
					? instructor.changed("assigned_vehicle_id")
					: false;

				if (assignedVehicleIdsChanged) {
					const normalizedIds = normalizeAssignedVehicleIds(instructor.assigned_vehicle_ids);
					instructor.assigned_vehicle_ids = normalizedIds;
					instructor.assigned_vehicle_id = normalizedIds[0] || null;
					return;
				}

				if (assignedVehicleIdChanged) {
					const normalizedId = Number(instructor.assigned_vehicle_id);
					instructor.assigned_vehicle_ids =
						Number.isInteger(normalizedId) && normalizedId > 0 ? [normalizedId] : [];
				}
			},
		},
	});

	return Instructor;
};
