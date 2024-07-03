import "dotenv/config";
import Youtube from "./google/youtube.js";
import Gemini from "./google/gemini.js";
import Drive from "./google/drive.js";
import Auth from "./google/auth.js";

export default { Auth, Gemini, Drive, Youtube };
