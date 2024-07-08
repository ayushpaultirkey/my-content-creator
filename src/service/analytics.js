import IO from "./analytics/io.js";
import Videos from "./analytics/videos.js";
import Video from "./analytics/video.js";
import Comment from "./analytics/video/comment.js";
import Report from "./analytics/report.js";
import Analyze from "./analytics/analyze.js";
import Config from "./google/youtube/analytics/@config.js";
import Prompt from "./analytics/video/comment/prompt.js";
import Send from "./analytics/video/comment/send.js";

export default {
    ... IO,
    Config,
    Videos,
    Report,
    Analyze,
    Video: Object.assign(Video, {
        Comment: Object.assign(Comment, {
            Prompt,
            Send
        })
    })
};