# My Content Creator

### How to use ?
Add the following API key in the `.env` file.
```
NODE_ENV="development"
PIXABAY_API="PIXABAY_KEY_HERE"
GOOGLE_GEMINI_API="GEMINI_API_KEY_HERE"
GOOGLE_APPLICATION_CREDENTIALS="src/secret/googlecloud-service.json"
GOOGLE_OAUTH2_CLIENT="src/secret/googleoauth2-client.json"
```

In `GOOGLE_OAUTH2_CLIENT` make sure to the callback value is set to `web.redirect_uris = [ "http://localhost:3000/api/google/auth/callback" ]`

More detail can be found in `/src/secret/README.md`, on how to get the credential and client json files.

Below are the steps to run on different operating systems. 
### *Windows*
Run the `npm run download` command to download the ffmpeg builds. The files will be downloaded in the `/library/` folder. If the download fails, you can manually download the ffmpeg build and place it in the folder:
- `/library/ffmpeg.exe`
- `/library/ffprobe.exe`

After that, run the install command to install the latest package of sharp.
```
npm install sharp@latest
npm install
```

### *Linux*
In Debain, install ffmpeg.
```
sudo apt-get update
sudo apt-get install ffmpeg
```

After that run the install command to install the modules.
```
npm install sharp@0.32.6
npm install
```

### *Starting*
After installing all the necessary files, use the `start` command start the application.
```
npm start
```