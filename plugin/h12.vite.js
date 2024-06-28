import Transform from "./h12.transform";

// Match for the .js files
const match = /\.(js)$/;

export default function h12Vite() {
    return {
        name: "h12VitePlugin",
        transform(src, id) {
            if(match.test(id)) {
                return {
                    code: Transform(src),
                    map: null
                };
            };
        }
    };
};