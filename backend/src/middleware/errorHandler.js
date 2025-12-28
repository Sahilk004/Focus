export function notFoundHandler(req, res, next) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.userMessage || "Internal server error", details: err.message });
}


