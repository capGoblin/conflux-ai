import express from "express";
import cors from "cors";
import multer from "multer";
import { createAutoDriveApi, fs } from "@autonomys/auto-drive";
import { NetworkId } from "@autonomys/auto-utils";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize your API instance with API key
const api = createAutoDriveApi({
  apiKey: process.env.AUTO_DRIVE_API_KEY,
  network: NetworkId.TAURUS,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Use CORS middleware to allow all origins
app.use(cors());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original file name
  },
});

const upload = multer({ storage }); // Initialize multer with the storage configuration

// Upload endpoint
app.post("/upload", upload.single("file"), async (req: any, res: any) => {
  const filePath = req.file.path; // Get the path of the uploaded file
  console.log(`File uploaded and saved to: ${filePath}`); // Log the file path for debugging

  const options = {
    password: 'password',
    onProgress: (progress: number) => {
      console.log(`The upload is completed is ${progress}% completed`);
    },
  };

  try {
    const cid = await fs.uploadFileFromFilepath(api, filePath, options);
    res.status(200).json({ message: "File uploaded successfully", cid });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Error uploading file" });
  }
});

// Download endpoint
app.get("/download/:cid", async (req: any, res: any) => {
  const { cid } = req.params;

  try {
    const stream = await api.downloadFile(cid);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename=${cid}.pth`);

    // Stream the file to response
    for await (const chunk of stream) {
      res.write(chunk);
    }
    res.end();
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Error downloading file" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
