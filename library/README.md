# Installing ffmpeg
#### **Windows**
- Run the `npm run download` command to download the ffmpeg builds. The files will be downloaded in the `/library/` folder.
- (Manual option): If the download fails, you can manually download the ffmpeg build from [https://github.com/ffbinaries/ffbinaries-prebuilt/releases/tag/v6.1](https://github.com/ffbinaries/ffbinaries-prebuilt/releases/tag/v6.1) and place it in the `/library/` folder:
    - `/library/ffmpeg.exe`
    - `/library/ffprobe.exe`

#### **Linux (Debian)**
```
sudo apt update
sudo apt install ffmpeg
```