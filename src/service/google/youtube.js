import Analytics from "../analytics.js";
import Upload from "./youtube/upload.js"
import Channel from "./youtube/channel.js"
import Videos from "./youtube/videos.js"
import Video from "./youtube/video.js"
import Comment from "./youtube/comment.js"
import Send from "./youtube/comment/send.js"

export default {
    Upload,
    Analytics,
    Channel,
    Videos,
    Video,
    Comment: Object.assign(Comment, {
        Send
    })
};