import cp from "child_process";
import fs from "fs";

import ffmpeg from "ffmpeg-static";

import { YtdlMp3Error } from "./functions";

export class FormatConverter {
	private readonly ffmpegBinary: string;

	constructor() {
		if (!ffmpeg) {
			throw new YtdlMp3Error("Failed to resolve ffmpeg binary");
		}
		this.ffmpegBinary = ffmpeg;
	}

	videoToAudio(videoData: Buffer, validPath: string, newPath: string): void {
		if (fs.existsSync(validPath)) {
			throw new YtdlMp3Error(`Output file already exists: ${validPath}`);
		}
		cp.execSync(`${this.ffmpegBinary} -loglevel 24 -i pipe:0 -vn -sn -c:a mp3 -ab 192k ${validPath}`, {
			input: videoData,
		});
		fs.rename(validPath, newPath, (err) => {
			if (err) console.error("RENAME ERR:", err);
		});
	}
}
