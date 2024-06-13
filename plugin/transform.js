import { JSDOM } from "jsdom";
import XRegExp from "xregexp";

/**
    * 
    * @param {string} code 
    * @returns {string}
*/
function Transform(code = "") {
    
    //Check if @Component is present
    if(code.indexOf("@Component") == -1) {
        return code;
    };

    //Remove @Component from string
    code = code.replace("@Component", "");

    //Get all template element
    const _matchTemplate = code.matchAll(/<>(.*?)<\/>/gs);
    for(const _template of _matchTemplate) {

        //Get all value that are inside {} bracket
        const _matchBracket = XRegExp.matchRecursive(_template[1], '{', '}', 'gi');
        for(const _bracket of _matchBracket) {

            //Prepare formatted bracket code to match with regex to check if {} is not inside "" or ''
            var _format = _bracket.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
            var _test = _template[1].match(new RegExp(`\\w+={${_format}}`));

            //If it's not inside the {} then add a @ before the value
            if(_test !== null) {
                _template[1] = _template[1].replace(`{${_bracket}}`, `"@${_bracket.replace(/"/g, "'").trim()}"`);
            };

        };
        
        //Pharse dom and replace it with methods
        const _dom = new JSDOM(_template[1]);
        const _transformed = DOMPharse(_dom.window.document.body.children[0]);
        code = code.replace(_template[0], _transformed);

    };
    
    //Return transformed code
    return code;
    
}

function DOMPharse(_element = document.body) {
    

    //Create code for component
    if(_element.tagName.toLowerCase() === "hx-app") {

        const _name = _element.getAttribute("name");
        const _scope = _element.getAttribute("scope");
        const _argument = _element.getAttribute("argument");

        return `await ${(_scope == null) ? "this" : _scope}.component(${_name},${_argument})`.replace(/,\]/g, "]");
    
    };

    //
    const _child = _element.childNodes;
    const _children = _element.children;
    const _attribute = _element.getAttributeNames();

    //
    let _attributeValue = "{";

    for(var i = 0; i < _attribute.length; i++) {

        let _value = _element.getAttribute(_attribute[i]);
        let _start = _value.match(/\S/g);

        if(_attribute[i] == "args" && _value == "") {
            continue;
        };

        if(_start !== null && _start[0] == "@") {

            _value = _value.replace("@", "");

            if(_start[1] == "[") {
                _attributeValue += `"${_attribute[i]}": ${_value},`;
                continue;
            };
            if(_start[1].match(/\./g) !== null && _start[2].match(/\./g) !== null && _start[3].match(/\./g) !== null) {
                _attributeValue += `"${_attribute[i]}": { ${_value} },`;
                continue;
            };
            if(_start[1].match(/[a-zA-Z_$]/g) !== null) {
                _attributeValue += `"${_attribute[i]}": ${_value},`;
                continue;
            };
            if(_start[1].match(/"|'|`/g) !== null) {
                _attributeValue += `"${_attribute[i]}": ${_value},`;
                continue;
            };
            if(_start[1].match(/\(/g) !== null) {
                _attributeValue += `"${_attribute[i]}": ${_value},`;
                continue;
            };
            if(_start[1].match(/{/g) !== null) {
                _value = _value.replace(/\s+/g, "");
            };

            continue;
        };

        _attributeValue += `"${_attribute[i]}": "${_value}",`

    };

    _attributeValue += "}";
    _attributeValue = _attributeValue.replace(",}", "}");
    _attributeValue = ((_attributeValue == "{}") ? "" : "," + _attributeValue);


    let _child_code = "";

    //Check all current element child node
    for(var i = 0, ilen = _child.length; i < ilen; i++) {

        //Check if current node is text node
        if(_child[i].nodeType == 3) {

            let _string = _child[i].nodeValue;
            let _match = _string.match(/\w+(?:\.\w+)+|\w+|\S+/gm);
            if(_match !== null) {

                //Remove extra space from string
                let _value = _string.replace(/\n|\s\s/g, "");
                let _test = "";

                //If node value is not empty then check for any key and split them into individual nodes
                if(_match.length > 1 || _children.length > 0) {
                    if(_value.indexOf("{") !== -1) {

                        let _split = _value.split(/{.*?}/g);
                        let _key = _value.match(/{.*?}/g);

                        //Iterate for all key
                        for(var j = 0, jlen = _split.length; j < jlen; j++) {
    
                            if(_split[j] !== "" && _split[j] !== " ") {
                                //_test += `this.node("span",[\`${_split[j]}\`]),`;
                                _test += `\`${_split[j]}\`,`;
                            };
                            _test += ((typeof(_key[j]) !== "undefined") ? `this.node("span",[\`${_key[j]}\`]),` : "");
                            //_test += ((typeof(_key[j]) !== "undefined") ? `\`${_key[j]}\`,` : "");
    
                        };

                    }
                    else {
                        //_test += `this.node("span",[\`${_value}\`]),`;
                        _test += `[\`${_value}\`],`;
                    };
                }
                else {
                    //_test += `[\`${_value}\`],`;
                    _test += `\`${_value}\`,`;
                };

                _child_code += _test;

            }
            /*else {
                _child_code += `[\`${_string}\`]`;
            }*/

        }
        else {
            _child_code += DOMPharse(_child[i]) + ",";
        };

    };


    if(_child_code.indexOf(",") !== -1) {
        _child_code = `[${_child_code}]`;
    }
    else {
        if(_child_code == "") {
            _child_code = "[]";
        };
    };


    let _component = (_element.hasAttribute("args")) ? "this.component" : "this.node";
    let _scope = (_element.hasAttribute("scope")) ? _element.getAttribute("scope").replace("@", "") : _component;
    let _await = (_element.hasAttribute("args")) ? "await " : "";

    let _name = _element.tagName.toLowerCase();
    _name = (_element.hasAttribute("args")) ? (_name.charAt(0).toUpperCase() + _name.slice(1)) : `"${_name}"`;

    let _code = `${_await} ${_scope}(${_name},${_child_code}${_attributeValue})`;
    
    return _code.replace(/,\]/g, "]").replace(/,,/g, ",");

}

export default Transform;