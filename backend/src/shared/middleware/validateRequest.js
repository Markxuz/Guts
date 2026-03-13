function validateRequest(schema, source = "body") {
  return (req, res, next) => {
    const target = req[source] || {};
    const { value, error } = schema.validate(target, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((detail) => detail.message),
      });
    }

    req[source] = value;
    return next();
  };
}

module.exports = {
  validateRequest,
};
