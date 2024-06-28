import fs from "fs";
import XRegExp from "xregexp";
import { JSDOM } from "jsdom";

/**
    * H12 transpiler function
    * @param {string} code The js code containing H12 component
    * @returns {string}
    * @description
    * * Transform version: `v2.0.0`
    * * Github: https://github.com/ayushpaultirkey/h12
*/
function main(code = "") {

    // Check if the component contain @Component
    if(!code.includes("@Component")) {
        return code;
    };

    // Remove component tag from code
    code = code.replace(/@Component/g, "");

    //Get all template element
    const _matchTemplate = code.matchAll(/<>(.*?)<\/>/gs);
    for(const _template of _matchTemplate) {

        //Get all value that are inside {} bracket
        const _matchBracket = XRegExp.matchRecursive(_template[1], "{", "}", "gi");
        for(const _bracket of _matchBracket) {

            // If template contain any space then its not a key
            // Else the value is a key
            if(_bracket.match(/\s/gm)) {
                _template[1] = _template[1].replace(`{${_bracket}}`, `"___\${${_bracket.replace(/"/g, "'").trim()}\}___"`);
            };

        };
        
        // Pharse dom and replace it with methods
        const _dom = new JSDOM(_template[1]);
        const _transformed = pharse(_dom.window.document.body.children[0]);
        code = code.replace(_template[0], _transformed);

    };

    return code;

}

function pharse(_element = document.body) {

    // Get elements values
    const _child = _element.childNodes;
    const _children = _element.children;
    const _attribute = _element.getAttributeNames();

    // Create child's code
    let _childCode = "";

    // Create attribute value
    let _attributeValue = "{";
    
    // Iterate for all values
    for(var i = 0; i < _attribute.length; i++) {

        // Get attribute value
        let _value = _element.getAttribute(_attribute[i]);

        // Check if its a component and ignore args, ref and scope
        if((_attribute[i] == "args" && _value == "") || _attribute[i] == "ref" || _attribute[i] == "scope") {
            continue;
        };

        // Check for placeholder
        if(_value.indexOf("__") == 0) {

            // Replace placeholder
            _value = _value.replace(/___\${/g, "");
            _value = _value.replace(/}___/g, "");

            // Assign attribute value
            _attributeValue += `"${_attribute[i]}": ${_value},`;

        }
        else {

            // Assign attribute value
            _attributeValue += `"${_attribute[i]}": \`${_value}\`,`;

        };

    };

    // End attribute value
    _attributeValue += "}";
    _attributeValue = _attributeValue.replace(",}", "}");

    // Check all current element child node
    for(var i = 0, ilen = _child.length; i < ilen; i++) {

        // Check child node type
        if(_child[i].nodeType == 3) {

            // Get node content
            let _childValue = _child[i].nodeValue;
            let _childMatch = _childValue.match(/\w+(?:\.\w+)+|\w+|\S+/gm);

            // Check if the text node contain any value
            if(_childMatch !== null) {

                //Remove extra space from string
                let _textValue = _childValue.replace(/\n|\s\s/g, "");
                let _textSample = "";
            
                // Match for any key in the node
                const _keyMatch = _textValue.match(/\{[^{}\s]*\}/gm);

                //If node value is not empty then check for any key and split them into individual nodes
                if(_childMatch.length > 1 || _children.length > 0) {

                    // Check if the text node contain any dyanmic value
                    if(_keyMatch) {

                        // Perform split for the key of the non key can be
                        const _placeholder = "_SPLIT_";
                        let _modifiedString = _textValue;
                        if(_keyMatch) {
                            _keyMatch.forEach(match => {
                                _modifiedString = _modifiedString.replace(match, _placeholder);
                            });
                        };

                        // Split the string using the placeholder
                        const _splitPart = _modifiedString.split(_placeholder);

                        // Add the extracted matches back into the split parts
                        if(_keyMatch) {
                            for(let i = 0; i < _keyMatch.length; i++) {
                                _splitPart.splice(2 * i + 1, 0, _keyMatch[i]);
                            };
                        };

                        // Create a node value using the split parts
                        let _temp = "";
                        for(let i = 0; i < _splitPart.length; i++) {
                            if(_splitPart[i].length !== 0) {

                                if(_textValue.includes(`__$${_splitPart[i]}__`)) {
                                    _temp += "`$" + _splitPart[i] + "`,";
                                }
                                else {
                                    _temp += "`" + _splitPart[i] + "`,";
                                };

                            };
                        };

                        // Sample from the temp value
                        _textSample += _temp.replace(/"___\$|___"/g, "");

                    }
                    else {

                        // When text node doesnt contain any key
                        _textSample += `\`${_textValue}\`,`;

                    };
                    
                }
                else {

                    // When there is no child
                    _textSample += `\`${_textValue}\`,`;

                };

                // Replace placeholder
                _textSample = _textSample.replace(/"___|___"/g, "");

                // Set the child node's value
                _childCode += _textSample;

            };
            
        }
        else {

            // Recursive for each chils
            _childCode += pharse(_child[i]) + ",";

        };

    };

    // Check if child is not empty
    if(_childCode.indexOf(",") !== -1) {
        _childCode = `[${_childCode}]`;
    }
    else {
        if(_childCode == "") {
            _childCode = "[]";
        };
    };

    // Get node function type
    let _component = (_element.hasAttribute("args")) ? "await this.component" : "this.node";   

    let _scope = (_element.hasAttribute("scope")) ? _element.getAttribute("scope") : _component;

    // Get name of the node and check if the refernce is present
    let _name = _element.tagName.toLowerCase();
    _name = (_element.hasAttribute("args")) ? (_name.charAt(0).toUpperCase() + _name.slice(1)) : `"${_name}"`;

    let _reference = (_element.hasAttribute("ref")) ? _element.getAttribute("ref") : _name;

    // Replace placeholder
    _reference = _reference.replace(/___\${/g, "");
    _reference = _reference.replace(/}___/g, "");

    // Create node code
    let _code = `${_scope}(${_reference},${_childCode},${_attributeValue})`;
    
    // Return the formatted code
    return _code.replace(/,\]/g, "]").replace(/,,/g, ",");

};

export default main;