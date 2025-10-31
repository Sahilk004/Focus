export function validateYoutubeUrl(req, res, next) {
  const url = (req.body?.url || "").trim();
  if (!url) return res.status(400).json({ error: "URL is empty" });
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  if (!youtubeRegex.test(url)) return res.status(400).json({ error: "Please provide a valid YouTube URL" });
  next();
}

export function requireBodyField(field) {
  return (req, res, next) => {
    if (!req.body || typeof req.body[field] === "undefined" || req.body[field] === null || String(req.body[field]).trim() === "") {
      return res.status(400).json({ error: `${field} is required` });
    }
    next();
  };
}


