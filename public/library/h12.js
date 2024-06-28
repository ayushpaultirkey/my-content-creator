window.$fx = {};

/**
    * H12 component class
    * @description
    * * Client version: `v2.0.0`
    * * Github: https://github.com/ayushpaultirkey/h12
*/
export default class H12 {
    constructor() {
        
        /** @type {string} */
        this.id = crypto.randomUUID();

        /** @type {Element} */
        this.root = null;

        /** @type {any} */
        this.args = {};

        /** @type {H12} */
        this.parent = null;

        /** @type {Object<string, H12>} */
        this.child = {};

        /** @type {Object<string, Element>} */
        this.element = {};

    }

    #binding = {};

    /**
        * Create's a render template for the element
        * @async
        * @returns {Promise<Element | null>}
        * @example
        * async render() {
        *   return <>
        *       <div>Hello world</div>
        *   </>
        * }
        * Will be converted to:
        * async render() {
        *   return this.node("div", ["Hello world"])
        * }
    */
    async render() {
        return this.node("div");
    }

    /**
        * This function is called after component build and is ready to be rendered.
        * @async
        * @param {*} args The arguments passed by the `pre()` function, alternatively it can also be accessed by `this.args`
        * @example
        * async init(args = {}) {
        *   this.Set("{color}", "red");
        * }
    */
    async init(args = {}) {}

    /**
        * This function is called after the component is rendered. This only work on root component, the child component wont call this function.
        * To use this you can register a dispatcher event.
        * 
        * @async
        * @example
        * async finally(args = {}) {
        *   console.log(this.id, "loaded !");
        * }
    */
    async finally() {}
    
    /**
        * Preapre the component for rendering and initialize the values.
        * @async
        * @param {string} element The element's query selector
        * @param {*} args The argument to be passed while creating component
        * @returns {Promise<Element, null>}
        * 
        * @example
        * const app = new App();
        * app.pre(".root");
    */
    async pre(element = null, args = {}) {

        // Try and render the component
        try {

            // Create the root element for the component and find the unique id
            this.root = await this.render();
            this.#unique("id", this.element);

            // If the arguments contain child then try to set the {child} key
            // It is usually passed is the component tag have a child element
            if(this.args.child instanceof Element) {
                this.Set("{child}", this.args.child);
            };

            // Initialize the component
            await this.init(args);
            
            // If the element is not null then render it
            if(element !== null) {
                document.querySelector(element).appendChild(this.root);
                await this.finally();
            };

            // Else return the root node
            return this.root;

        }
        catch(exception) {
            console.error(`H12.pre(): Initialize error\n${exception.stack}`);
            return null;
        };

    }

    /**
        * Create a element to render it along with bindings.
        * `1 | T`: Text, 
        * `2 | E`:  Element, 
        * `3 | A`:  Attribute
        * 
        * @param {string} type Element or component name
        * @param {Array<Element|string>} child Array of child elements or string
        * @param {Object<string, string | Function>} attribute Object with key as attribute name and with value
        * @returns {Element}
        * 
        * @example
        * this.node("div", ["Hello world"])
        * this.node("div", ["Hello world"], { class: "bg-red-500" })
        * this.node("div", ["Hello world"], { onclick: () => {} })
    */
    node(type = "", child = [], attribute = {}) {

        // Create new element using the type
        let _element = document.createElement(type);
        let _attribute = [];

        // Iterate for each child
        for(var i = 0, len = child.length; i < len; i++) {

            // Is its simple string then check for the key and append that text node
            if(typeof(child[i]) === "string") {

                // Create a new text node
                let _text = document.createTextNode(child[i]);
                _element.append(_text);

                // Match for any possible key
                // If no key then skip other steps
                let _match = child[i].match(/\{[^{}\s]*\}/gm);
                if(_match == null) {
                    continue;
                };

                // Add binding and continie
                if(typeof(this.#binding[_match[0]]) === "undefined") {
                    this.#binding[_match[0]] = { element: [], data: "" };
                };
                this.#binding[_match[0]].element.push({ node: _text, type: "T", clone: [] });

                continue;

            };

            // Append the non text element
            _element.append(child[i]);

        };

        // Check for key in the attribute
        for(const key in attribute) {
            
            // Get attribute's value
            let _value = attribute[key];
            
            // If its string then match for any key and push the attribute's name into _attribute
            if(typeof(_value) === "string" && _value.match(/\{[^{}\s]*\}/gm)) {

                _attribute.push(key);

            }
            else if(typeof(_value) === "function") {

                // Is the value is function then bind events
                _value = this.#event(_value);

            };

            // Set attribute's value
            _element.setAttribute(key, _value);

        };

        // Iterate for all attribute that have key
        for(var i = 0, ilen = _attribute.length; i < ilen; i++) {

            // Get key and attribute value
            let _value = _element.getAttribute(_attribute[i]);
            let _match = _value.match(/\{[^{}\s]*\}/gm);

            // If it contain any key then iterate for all those keys and append it to binding
            if(_match !== null) {
                for(var j = 0, jlen = (_match == null) ? 0 : _match.length; j < jlen; j++) {

                    // Create new binding if undefined
                    if(typeof(this.#binding[_match[j]]) === "undefined") {
                        this.#binding[_match[j]] = { element: [], data: _match[j] };
                    };
                    this.#binding[_match[j]].element.push({ node: _element, type: "A", name: _attribute[i], map: _value });

                };
            };

        };

        // Return element
        return _element;

    }

    /**
        * 
        * @param {H12} node 
        * @param {Array<Element> | Function} child
        * @param {any} args
        * @returns {Promise<H12 | undefined>}
    */
    async component(node = null, child = [], args = {}) {

        if(node instanceof Object) {

            const _component = new node();
            _component.parent = this;
            _component.args = args;
            _component.args.child = child[0];

            if(typeof(args.id) !== "undefined") {
                _component.id = args.id;
            };

            this.child[(typeof(args.id) !== "undefined") ? args.id : _component.id] = _component;

            return await _component.pre(null, args);

        };

    }

    /**
        * For checking value types.
        * `string`, `boolean`, `number`, `string` returns true
        * @param {*} value 
        * @returns {boolean}
    */
    #vtype(value = "") {
        if(typeof(value) === "bigint" || typeof(value) === "boolean" || typeof(value) === "number" || typeof(value) === "string") {
            return true;
        };
        return false;
    }

    /**
        * Bind events into an element
        * @param {Function} event 
        * @returns {string}
    */
    #event(event = null) {
        let _id = crypto.randomUUID();
        $fx[_id] = event.bind(this);
        return `$fx['${_id}'](this);`;
    }
    
    /**
        * 
        * @param {string} key 
        * @param {string | Element | Function} value 
    */
    Set(key = "", value = "") {

        // Get position index and remove from key
        let _index = key.indexOf("++");
        key = key.replace("++", "");

        // Get binding and check it
        let _bind = this.#binding[key];
        if(typeof(_bind) === "undefined") {
            return null;
        };

        // Check if the value is function, if so then bind the event
        if(typeof(value) === "function") {
            value = this.#event(value);
        };

        // Iterate for all binding elements
        let _element = _bind.element;
        for(var i = 0, ilen = _element.length; i < ilen; i++) {

            /** @type {Element} */
            let _node = _element[i].node;

            // If the element type is text, element or attribute
            if(_element[i].type == "T") {

                // Check if the new value is element or text
                if(value instanceof Element) {

                    // Replace the text node with element
                    _node.parentNode.replaceChild(value, _node);

                    // Update the binding
                    _element[i].type = "E";
                    _element[i].node = value;

                }
                else if(this.#vtype(value)) {

                    // Check for append position and insert text
                    // Avoid updating the binding value
                    if(_index < 0) {
                        _node.nodeValue = value;
                    }
                    else {
                        _node.nodeValue = _index === 0 ? value + _node.nodeValue : _node.nodeValue + value;
                    };

                };
                
            }
            else if(_element[i].type == "E") {

                // Get parent element
                const _parent = _node.parentNode;

                // Check if the new value is element or text
                if(value instanceof Element) {

                    // Check for position for insertign element
                    let _position = (_index == 0) ? "afterbegin" : "beforeend";

                    // Check the position defined then append it at certain position and avoid removing clone by `continue`
                    if(_index !== -1) {

                        // Append clone and continue
                        _parent.insertAdjacentElement(_position, value);
                        _element[i].clone.push(value);

                        // Ignore the removing of clones
                        continue;

                    }
                    else {

                        // Replace the current child and update the binding value
                        _parent.replaceChild(value, _node);
                        _element[i].node = value;

                    };
                    
                }
                else if(this.#vtype(value)) {

                    // Create new text node and replace it with the old node
                    const _text = document.createTextNode(value);
                    _parent.replaceChild(_text, _node);

                    // Update the element binding
                    _element[i].type = "T";
                    _element[i].node = _text;

                };

                // Remove all clones if the value is not appending or if value type changes
                _element[i].clone.forEach(x => {
                    x.remove();
                });
                _element[i].clone = [];

            }
            else if(_element[i].type == "A" && this.#vtype(value)) {

                // Get the mapping pattern for the attribute value and match the key
                let _map = _element[i].map;
                let _match = _map.match(/\{[^{}\s]*\}/gm);

                // If the match is success full, then iterate over all keys
                if(_match !== null) {
                    for(var j = 0, jlen = _match.length; j < jlen; j++) {

                        // If the key is same as the current matched key in map then replace
                        // it can ignore other steps
                        if(_match[j] === key) {
                            _map = _map.replace(_match[j], value);
                            continue;
                        };

                        // If the binding contain more keys then search for other key's value
                        let _subBind = this.#binding[_match[j]];
                        if(typeof(_subBind) === "undefined") {
                            continue;
                        };

                        // Mkae a new attribute value
                        _map = _map.replace(_match[j], _subBind.data);

                    };
                };

                // Set the new attribute value and update the binding data
                _node.setAttribute(_element[i].name, _map);
                _bind.data = value;

            };

        };

    }

    /**
        * Get the value of the key, it will only work it the key is of type attribute
        * @param {string} key 
        * @returns { null | string }
    */
    Get(key = "") {
        return typeof(this.#binding[key]) === "undefined" ? undefined : this.#binding[key].data;
    }

    /**
        * Create unique element in the component
        * @param {string} unique 
        * @param {object} store 
    */
    #unique(unique = "id", store = this.element) {

        this.root.querySelectorAll(`[${unique}]`).forEach(x => {
            store[x.getAttribute(unique)] = x;
            x.setAttribute(unique, "x" + Math.random().toString(36).slice(6));
        });
        
    }

    /**
        * Render the component into element
        * @param {H12} component 
        * @param {string} element 
    */
    static async Render(component = null, element = null) {
        try {
            const _component = new component();
            await _component.pre(element);
        }
        catch(exception) {
            console.error(`H12.Render(): Component error\n${exception.stack}`);
        };
    }

};