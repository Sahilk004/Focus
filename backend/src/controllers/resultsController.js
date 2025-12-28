import Result from "../models/resultModel.js";

export async function listResults(req, res) {
  try {
    const { type } = req.query || {};
    const query = { user: req.user?.id };
    if (type) query.type = type;
    const results = await Result.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, results });
  } catch (error) {
    console.error("Error listing results:", error);
    res.status(500).json({ error: "Failed to fetch results", details: error.message });
  }
}

export async function getResult(req, res) {
  try {
    const { id } = req.params;
    const result = await Result.findOne({ _id: id, user: req.user?.id }).lean();
    if (!result) return res.status(404).json({ error: "Result not found" });
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error getting result:", error);
    res.status(500).json({ error: "Failed to fetch result", details: error.message });
  }
}

export async function deleteResult(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Result.findOneAndDelete({ _id: id, user: req.user?.id });
    if (!deleted) return res.status(404).json({ error: "Result not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({ error: "Failed to delete result", details: error.message });
  }
}
