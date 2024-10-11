import fs from "fs";

/**
 * Checks if the given path corresponds to a directory.
 *
 * @param path - the path to check.
 * @returns `true` if the path exists and is a directory, `false` otherwise.
 */
export function isDirectory(path: string): boolean {
	return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
}

/**
 * Custom error class representing unrecoverable errors intentionally thrown by ytdl-mp3
 */
export class YtdlMp3Error extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "YtdlMp3Error";
	}
}
