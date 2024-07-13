import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
    * 
    * @param {*} path 
    * @returns 
*/
export default async function ReadPDF(path) {
    let _doc = await getDocument(path).promise;
    let _page1 = await _doc.getPage(1);
    let _content = await _page1.getTextContent();
    let _strings = _content.items.map(function(item) {
        return item.str;
    });
    return _strings;
};