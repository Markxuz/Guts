function sendSuccess(res, data, { status = 200, meta = {} } = {}) {
  return res.status(status).json({
    data,
    meta,
  });
}

module.exports = {
  sendSuccess,
};
