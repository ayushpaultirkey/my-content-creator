import IO from "./analytics/io.js";
import Videos from "./analytics/videos.js";
import Video from "./analytics/video.js";
import Prompt from "./analytics/prompt.js";
import Comment from "./analytics/video/comment.js";
import Report from "./analytics/report.js";
import Analyze from "./analytics/analyze.js";
import Config from "./analytics/@config.js";
import CPrompt from "./analytics/video/comment/prompt.js";
import Send from "./analytics/video/comment/send.js";

export default {
    ... IO,
    Config,
    Videos,
    Report,
    Prompt,
    Analyze,
    Video: Object.assign(Video, {
        Comment: Object.assign(Comment, {
            Prompt: CPrompt,
            Send
        })
    })
};