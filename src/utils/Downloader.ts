import os from "os";
import path from "path";

import ytdl from "@distube/ytdl-core";
import type { videoInfo as VideoInfo } from "@distube/ytdl-core";

import { FormatConverter } from "./FormatConverter";
import { YtdlMp3Error, isDirectory, removeParenthesizedText } from "./functions";

export type DownloaderOptions = {
	outputDir?: string;
	silentMode?: boolean;
	verifyTags?: boolean;
};

export class Downloader {
	static defaultDownloadsDir = path.join(os.homedir(), "Downloads");

	outputDir: string;
	silentMode: boolean;
	verifyTags: boolean;

	constructor({ outputDir, silentMode, verifyTags }: DownloaderOptions) {
		this.outputDir = outputDir ?? Downloader.defaultDownloadsDir;
		this.silentMode = Boolean(silentMode);
		this.verifyTags = Boolean(verifyTags);
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

		const outputFile = this.getOutputFile(videoInfo.videoDetails.title);
		const videoData = await this.downloadVideo(videoInfo).catch((error) => {
			throw new YtdlMp3Error("Failed to download video", {
				cause: error,
			});
		});

		formatConverter.videoToAudio(videoData, outputFile);

		if (!this.silentMode) console.log(`Done! Output file: ${outputFile}`);
		return outputFile;
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

	/** Returns the absolute path to the audio file to be downloaded */
	private getOutputFile(videoTitle: string): string {
		const baseFileName = removeParenthesizedText(videoTitle)
			.replace(/[^a-z0-9]/gi, "_")
			.split("_")
			.filter((element) => element)
			.join("_")
			.toLowerCase();
		return path.join(this.outputDir, baseFileName + ".mp3");
	}
}