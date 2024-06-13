import Transform from "./transform";

const match = /\.(js)$/;

export default function H12VitePlugin() {
    return {
        name: "H12VitePlugin",
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