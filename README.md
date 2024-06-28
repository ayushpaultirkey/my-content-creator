# My Content Creator

### How to use ?
Run the following command to download the ffmpeg library and the necessary modules.
```
npm run download
npm install
```

The ffmpeg library will be downloaded into `/library/` folder. If the download failed, then you can manually download the ffmpeg build and place it in folder.
+ `/library/ffmpeg.exe`
+ `/library/ffprobe.exe`

Add the Gemini API key in the `.env` file.
```
NODE_ENV="development"
PIXABAY_API="PIXABAY_KEY_HERE"
ELEVENLABS_API="ELEVENLABS_API_KEY_HERE"
GOOGLE_GEMINI_API="GEMINI_API_KEY_HERE"
GOOGLE_CLIENT_ID="GOOGLE_CLIENT_ID_KEY_HERE"
GOOGLE_CLIENT_SECRET="GOOGLE_CLIENT_SECRET_KEY_HERE"
GOOGLE_REDIRECT_URIS="GOOGLE_REDIRECT_URIS_HERE"
```

After that run the `start` command.
```
npm start
```