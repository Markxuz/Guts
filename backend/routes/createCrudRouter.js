const express = require("express");

const createCrudRouter = (model, options = {}) => {
  const router = express.Router();
  const defaultOrderField = options.defaultOrderField || "id";
  const defaultOrderDirection = options.defaultOrderDirection || "DESC";
  const createRequiredFields = options.createRequiredFields || [];
  const sanitizeResponse = options.sanitizeResponse;

  const toResponse = (record) => {
    if (!record) return record;
    const plain = typeof record.toJSON === "function" ? record.toJSON() : record;
    return sanitizeResponse ? sanitizeResponse(plain) : plain;
  };

  router.get("/", async (req, res) => {
    try {
      const rows = await model.findAll({
        order: [[defaultOrderField, defaultOrderDirection]],
      });

      return res.status(200).json(rows.map(toResponse));
    } catch (error) {
      return res.status(500).json({ message: `Failed to fetch ${model.name} records`, error: error.message });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const row = await model.findByPk(req.params.id);

      if (!row) {
        return res.status(404).json({ message: `${model.name} not found` });
      }

      return res.status(200).json(toResponse(row));
    } catch (error) {
      return res.status(500).json({ message: `Failed to fetch ${model.name}`, error: error.message });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const missing = createRequiredFields.filter((field) => !req.body[field]);
      if (missing.length > 0) {
        return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
      }

      const created = await model.create(req.body);
      return res.status(201).json(toResponse(created));
    } catch (error) {
      return res.status(400).json({ message: `Failed to create ${model.name}`, error: error.message });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const row = await model.findByPk(req.params.id);

      if (!row) {
        return res.status(404).json({ message: `${model.name} not found` });
      }

      await row.update(req.body);
      return res.status(200).json(toResponse(row));
    } catch (error) {
      return res.status(400).json({ message: `Failed to update ${model.name}`, error: error.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const row = await model.findByPk(req.params.id);

      if (!row) {
        return res.status(404).json({ message: `${model.name} not found` });
      }

      await row.destroy();
      return res.status(200).json({ message: `${model.name} deleted successfully` });
    } catch (error) {
      return res.status(400).json({ message: `Failed to delete ${model.name}`, error: error.message });
    }
  });

  return router;
};

module.exports = createCrudRouter;
