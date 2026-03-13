const express = require("express");
const Joi = require("joi");
const { sendHttpError } = require("../src/shared/http/response");

const createCrudRouter = (model, options = {}) => {
  const router = express.Router();
  const defaultOrderField = options.defaultOrderField || "id";
  const defaultOrderDirection = options.defaultOrderDirection || "DESC";
  const createRequiredFields = options.createRequiredFields || [];
  const sanitizeResponse = options.sanitizeResponse;
  const listInclude = options.listInclude || [];
  const detailInclude = options.detailInclude || [];
  const createSchema = options.createSchema || null;
  const updateSchema = options.updateSchema || null;

  const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
  });

  const validateSchema = (schema, payload) => {
    const { value, error } = schema.validate(payload || {}, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (!error) {
      return { value, error: null };
    }

    const validationError = new Error("Validation error");
    validationError.status = 400;
    validationError.details = error.details.map((detail) => detail.message);

    return { value: null, error: validationError };
  };

  const toResponse = (record) => {
    if (!record) return record;
    const plain = typeof record.toJSON === "function" ? record.toJSON() : record;
    return sanitizeResponse ? sanitizeResponse(plain) : plain;
  };

  router.get("/", async (req, res) => {
    try {
      const rows = await model.findAll({
        include: listInclude,
        order: [[defaultOrderField, defaultOrderDirection]],
      });

      return res.status(200).json(rows.map(toResponse));
    } catch (error) {
      return sendHttpError(res, error, 500, `Failed to fetch ${model.name} records`);
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const idValidation = validateSchema(idParamSchema, req.params);
      if (idValidation.error) {
        return sendHttpError(res, idValidation.error, 400, "Validation error");
      }

      const row = await model.findByPk(req.params.id, {
        include: detailInclude,
      });

      if (!row) {
        return res.status(404).json({ message: `${model.name} not found` });
      }

      return res.status(200).json(toResponse(row));
    } catch (error) {
      return sendHttpError(res, error, 500, `Failed to fetch ${model.name}`);
    }
  });

  router.post("/", async (req, res) => {
    try {
      if (createSchema) {
        const createValidation = validateSchema(createSchema, req.body);
        if (createValidation.error) {
          return sendHttpError(res, createValidation.error, 400, "Validation error");
        }
        req.body = createValidation.value;
      }

      const missing = createRequiredFields.filter((field) => !req.body[field]);
      if (missing.length > 0) {
        return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
      }

      const created = await model.create(req.body);
      return res.status(201).json(toResponse(created));
    } catch (error) {
      return sendHttpError(res, error, 400, `Failed to create ${model.name}`);
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const idValidation = validateSchema(idParamSchema, req.params);
      if (idValidation.error) {
        return sendHttpError(res, idValidation.error, 400, "Validation error");
      }

      if (updateSchema) {
        const updateValidation = validateSchema(updateSchema, req.body);
        if (updateValidation.error) {
          return sendHttpError(res, updateValidation.error, 400, "Validation error");
        }
        req.body = updateValidation.value;
      }

      const row = await model.findByPk(req.params.id);

      if (!row) {
        return res.status(404).json({ message: `${model.name} not found` });
      }

      await row.update(req.body);
      return res.status(200).json(toResponse(row));
    } catch (error) {
      return sendHttpError(res, error, 400, `Failed to update ${model.name}`);
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const idValidation = validateSchema(idParamSchema, req.params);
      if (idValidation.error) {
        return sendHttpError(res, idValidation.error, 400, "Validation error");
      }

      const row = await model.findByPk(req.params.id);

      if (!row) {
        return res.status(404).json({ message: `${model.name} not found` });
      }

      await row.destroy();
      return res.status(200).json({ message: `${model.name} deleted successfully` });
    } catch (error) {
      return sendHttpError(res, error, 400, `Failed to delete ${model.name}`);
    }
  });

  return router;
};

module.exports = createCrudRouter;
