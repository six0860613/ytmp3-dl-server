import os from "os";
import path from "path";

import ytdl from "@distube/ytdl-core";
import type { videoInfo as VideoInfo } from "@distube/ytdl-core";

import { FormatConverter } from "./FormatConverter";
import { YtdlMp3Error, isDirectory } from "./functions";

export type DownloaderOptions = {
	outputDir?: string;
	silentMode?: boolean;
};

export class Downloader {
	static defaultDownloadsDir = path.join(os.homedir(), "Downloads");

	outputDir: string;

	constructor({ outputDir }: DownloaderOptions) {
		this.outputDir = outputDir ?? Downloader.defaultDownloadsDir;
	}

	async downloadSong(url: string): Promise<string> {
		if (!isDirectory(this.outputDir)) {
			throw new YtdlMp3Error(`Not a directory: ${this.outputDir}`);
		}
		const videoInfo = await ytdl.getInfo(url).catch((error) => {
			throw new YtdlMp3Error(`Failed to fetch info for video with URL: ${url}`, {
				cause: error,
			});
		});

		const formatConverter = new FormatConverter();

		const validPath = path.join(__dirname, "../tmp/temp.mp3");
		const newPath = path.join(
			this.outputDir,
			`${videoInfo.videoDetails.title.replace(/[/\\?%*:|"<>\/／\\]/gm, "_")}.mp3`
		);
		const videoData = await this.downloadVideo(videoInfo).catch((error) => {
			throw new YtdlMp3Error("Failed to download video", {
				cause: error,
			});
		});

		formatConverter.videoToAudio(videoData, validPath, newPath);
		return newPath;
	}

	/** Returns the content from the video as a buffer */
	private async downloadVideo(videoInfo: VideoInfo): Promise<Buffer> {
		const buffers: Buffer[] = [];
		const stream = ytdl.downloadFromInfo(videoInfo, { quality: "highestaudio" });
		return new Promise((resolve, reject) => {
			stream.on("data", (chunk: Buffer) => {
				buffers.push(chunk);
			});
			stream.on("end", () => {
				resolve(Buffer.concat(buffers));
			});
			stream.on("error", (err) => {
				reject(err);
			});
		});
	}
}
