const Joi = require("joi");

const optionalText = Joi.string().trim().allow("", null);

const courseCreateSchema = Joi.object({
  course_name: Joi.string().trim().required(),
  description: optionalText,
});

const courseUpdateSchema = Joi.object({
  course_name: Joi.string().trim(),
  description: optionalText,
}).min(1);

const packageCreateSchema = Joi.object({
  package_name: Joi.string().trim().required(),
  price: Joi.number().min(0).allow(null),
});

const packageUpdateSchema = Joi.object({
  package_name: Joi.string().trim(),
  price: Joi.number().min(0).allow(null),
}).min(1);

const dlCodeCreateSchema = Joi.object({
  code: Joi.string().trim().required(),
  description: optionalText,
});

const dlCodeUpdateSchema = Joi.object({
  code: Joi.string().trim(),
  description: optionalText,
}).min(1);

const instructorCreateSchema = Joi.object({
  name: Joi.string().trim().required(),
  license_number: Joi.string().trim().required(),
  specialization: Joi.string().valid("PDC Certified", "TDC Certified").required(),
  status: Joi.string().valid("Active", "On Leave").required(),
  assigned_vehicle_id: Joi.number().integer().positive().allow(null),
  phone: Joi.string().trim().max(20).allow("", null),
  tdc_cert_expiry: Joi.date().iso().allow(null, ""),
  pdc_cert_expiry: Joi.date().iso().allow(null, ""),
  certification_file_name: optionalText,
});

const instructorUpdateSchema = Joi.object({
  name: Joi.string().trim(),
  license_number: Joi.string().trim(),
  specialization: Joi.string().valid("PDC Certified", "TDC Certified"),
  status: Joi.string().valid("Active", "On Leave"),
  assigned_vehicle_id: Joi.number().integer().positive().allow(null),
  phone: Joi.string().trim().max(20).allow("", null),
  tdc_cert_expiry: Joi.date().iso().allow(null, ""),
  pdc_cert_expiry: Joi.date().iso().allow(null, ""),
  certification_file_name: optionalText,
}).min(1);

const vehicleCreateSchema = Joi.object({
  vehicle_name: Joi.string().trim().allow("", null),
  plate_number: Joi.string().trim().required(),
  vehicle_type: Joi.string().valid("Sedan", "Motorcycle", "Car", "Motor").required(),
});

const vehicleUpdateSchema = Joi.object({
  vehicle_name: Joi.string().trim().allow("", null),
  plate_number: Joi.string().trim(),
  vehicle_type: Joi.string().valid("Sedan", "Motorcycle", "Car", "Motor"),
}).min(1);

const maintenanceCreateSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive().required(),
  service_type: Joi.string().trim().required(),
  date_of_service: Joi.date().iso().required(),
  next_schedule_date: Joi.date().iso().required(),
  maintenance_cost: Joi.number().min(0).allow(null),
  remarks: optionalText,
});

const maintenanceUpdateSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive(),
  service_type: Joi.string().trim(),
  date_of_service: Joi.date().iso(),
  next_schedule_date: Joi.date().iso(),
  maintenance_cost: Joi.number().min(0).allow(null),
  remarks: optionalText,
}).min(1);

const fuelCreateSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive().required(),
  liters: Joi.number().positive().required(),
  amount_spent: Joi.number().positive().required(),
  odometer_reading: Joi.number().min(0).required(),
  logged_at: Joi.date().iso().allow(null, ""),
});

const fuelUpdateSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive(),
  liters: Joi.number().positive(),
  amount_spent: Joi.number().positive(),
  odometer_reading: Joi.number().min(0),
  logged_at: Joi.date().iso().allow(null, ""),
}).min(1);

const certificateCreateSchema = Joi.object({
  certificate_number: Joi.string().trim().required(),
  issue_date: Joi.date().iso().allow(null, ""),
  remarks: optionalText,
});

const certificateUpdateSchema = Joi.object({
  certificate_number: Joi.string().trim(),
  issue_date: Joi.date().iso().allow(null, ""),
  remarks: optionalText,
}).min(1);

module.exports = {
  courses: {
    createSchema: courseCreateSchema,
    updateSchema: courseUpdateSchema,
  },
  packages: {
    createSchema: packageCreateSchema,
    updateSchema: packageUpdateSchema,
  },
  dlCodes: {
    createSchema: dlCodeCreateSchema,
    updateSchema: dlCodeUpdateSchema,
  },
  instructors: {
    createSchema: instructorCreateSchema,
    updateSchema: instructorUpdateSchema,
  },
  vehicles: {
    createSchema: vehicleCreateSchema,
    updateSchema: vehicleUpdateSchema,
  },
  maintenanceLogs: {
    createSchema: maintenanceCreateSchema,
    updateSchema: maintenanceUpdateSchema,
  },
  fuelLogs: {
    createSchema: fuelCreateSchema,
    updateSchema: fuelUpdateSchema,
  },
  certificates: {
    createSchema: certificateCreateSchema,
    updateSchema: certificateUpdateSchema,
  },
};
