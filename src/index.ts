import express from "express";
import cors from "cors";
import path from "path";
import { Downloader } from "./utils/Downloader";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// API route to download mp3
app.get("/download", async (req, res) => {
	try {
		const videoUrl = req.query.url as string;

		console.log("Start download:", videoUrl);

		const outputDir = process.env.OUTPUT_DIR || path.join(__dirname, "../");
		const downloader = new Downloader({ outputDir });

		const fileUrl = await downloader.downloadSong(videoUrl);

		console.log("File is saved at:", fileUrl);

		res.json({ fileUrl });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "An error occurred while downloading the song." });
	}
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
