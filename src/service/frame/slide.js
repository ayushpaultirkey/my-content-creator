import directory from "../../library/directory.js";

import Render from "./slide/render.js";
import Modified from "../slide/modified.js";
import Duration from "../slide/duration.js";

// Get current directory path and filename
const { __root } = directory();

// Export
export default { Render, Modified, Duration };