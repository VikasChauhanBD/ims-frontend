import fs from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import formidable from "formidable";
import { randomUUID } from "node:crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { files } = await parseForm(req);
    const uploaded = files?.file;
    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;

    if (!file?.filepath) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const ext = path.extname(file.originalFilename || "") || "";
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const pathname = `ims/uploads/${randomUUID()}${safeExt}`;

    const blob = await put(pathname, fs.createReadStream(file.filepath), {
      access: "public",
      contentType: file.mimetype || "application/octet-stream",
    });

    res.status(200).json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Upload failed" });
  }
}

