import "dotenv/config";
import path from "path";
import chalk from "chalk";
import axios from "axios";
import crypto from "crypto";

import Cache from "./cache.js";
import Fallback from "./fallback.js";
import DownloadFiles from "./download-files.js";


export default async function FetchExternalImage({ keyword, count = 5, callback }) {

    const _query = keyword;
    const _cache = Cache.Hit(_query, "image");
    const _cachePath = Cache.Path();
    let _collection = [];

    try {

        // Check if keyword and count is valid
        if(!count || !keyword) {
            throw new Error("Invalid count or keyword");
        };

        // Check if the cache is found
        if(!_cache) {

            console.log(chalk.yellow("/S/Asset/FetchExternalImage():"), "NO CACHE FOUND");

            // Get images from pixabay
            const { headers, data } = await axios.get("https://pixabay.com/api/", {
                params: {
                    key: process.env.PIXABAY_API,
                    q: _query,
                    per_page: count + 10,
                },
            });

            console.log(chalk.yellow(`/S/Asset/FetchExternalImage():`), `Rate Limit: ${headers["x-ratelimit-limit"]}`);
            console.log(chalk.yellow(`/S/Asset/FetchExternalImage():`), `Rate Limit Remaining: ${headers["x-ratelimit-reset"]}`);
            console.log(chalk.yellow(`/S/Asset/FetchExternalImage():`), `Rate Limit Resets in: ${headers["x-ratelimit-remaining"]} seconds`);

            // Check if the images are found
            if(data.hits.length < count) {
                console.log(chalk.yellow("/S/Asset/FetchExternalImage():"), "Mismatch slides and default images");
            };

            // Iterate over all images and download them
            const _image = [];
            for(var i = 0, len = count; i < len; i++) {

                const _name = `/${crypto.randomUUID()}.jpg`;
                const _path = path.join(_cachePath, _name);

                if(!data.hits[i]) {
                    _image.push({
                        name: _name,
                        url: "https://picsum.photos/512",
                        destination: path.join(_cachePath, _name)
                    })
                    console.log(chalk.red("/S/Asset/FetchExternalImage():"), "Invalid response hit at index", i);
                    continue;
                };

                _image.push({
                    name: _name,
                    url: data.hits[i].largeImageURL,
                    destination: path.join(_cachePath, _name)
                });

                console.log(chalk.yellow(`/S/Asset/FetchExternalImage():`), `${_path} queued for download`);

            };

            // Update the cache data
            Cache.Update(_query, "image", _image);
            console.log(chalk.yellow("/S/Asset/FetchExternalImage():"), "CACHE UPDATED");

            // Save cache file
            await Cache.Save();
            console.log(chalk.green("/S/Asset/FetchExternalImage():"), "CACHE SAVED");

            // Download files
            _collection = await DownloadFiles(_image);

        }
        else {

            console.log(chalk.green("/S/Asset/FetchExternalImage():"), "CACHE FOUND");

            if(_cache.length < count) {
                console.log(chalk.yellow("/S/Asset/FetchExternalImage():"), "Mismatch slides and default images");
            };

            // Iterate over all the cache and count
            for(var i = 0, len = count; i < len; i++) {

                // If cache is not found then use fallback file
                if(!_cache[i]) {

                    _collection.push((_cache[0]) ? _cache[0].destination : path.join(Fallback("IMAGE")));

                    console.log(chalk.yellow("/S/Asset/FetchExternalImage():"), "Invalid cache hit at index", i, "using random index", 0);
                    continue;

                };

                _collection.push(_cache[i].destination);

            };

        };


    }
    catch(error) {
        console.log(chalk.red("/S/Asset/FetchExternalImage():"), error);
        throw new Error("Unable to download images");
    }
    
    return _collection;

};