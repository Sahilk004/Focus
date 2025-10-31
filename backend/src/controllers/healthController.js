export function status(req, res) {
  res.json({ status: "ok", message: "Server is running" });
}