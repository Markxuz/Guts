function sendHttpError(res, error, fallbackStatus = 500, fallbackMessage = "Request failed") {
  const status = Number(error?.status) || fallbackStatus;
  const message = error?.message || fallbackMessage;

  const payload = { message };

  if (Array.isArray(error?.details) && error.details.length > 0) {
    payload.details = error.details;
  }

  return res.status(status).json(payload);
}

module.exports = {
  sendHttpError,
};
