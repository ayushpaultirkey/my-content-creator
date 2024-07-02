import path from "path";
import { FFCreator } from "ffcreator";

import directory from "../library/directory.js";

import Render from "./slide/render.js";
import Modified from "./slide/modified.js";
import Duration from "./slide/duration.js";


// Get current directory path and filename
const { __root } = directory();

// Set ffmpeg path
FFCreator.setFFmpegPath(path.join(__root, "/library/ffmpeg.exe"));
FFCreator.setFFprobePath(path.join(__root, "/library/ffprobe.exe"));


// Export
export default { Render, Modified, Duration };