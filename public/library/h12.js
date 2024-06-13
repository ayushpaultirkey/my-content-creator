window.$fx = {};

class Component {
    constructor() {

        /**
            * Unique Id of the component, can be assigned while creating new component
            * @type {string}
        */
        this.id = crypto.randomUUID();
        
        /**
            * Store the elements that can be updated by the keys
            * @type {Object.<string, { element: [], data: string }>}
        */
        this.binding = {};

        /**
            * The root element of the component, created inside the `pre()` function
            * @type {Element | null}
        */
        this.root = null;

        /**
            * The parent component of the current component
            * @type {Component | null}
        */
        this.parent = null;
        
        /**
            * The child components of the current component
            * @type {Object.<string, Component>}
        */
        this.child = {};

        /**
            * Store the unique elements
            * @type {Object.<string, Element>}
        */
        this.element = {};

        /**
            * Store the arguments that was passed while creating the component
            * @type {any}
        */
        this.args = {};

    }

    /**
        * 
        * @returns {Element}
    */
    async render() {
        return this.node("div");
    }

    /**
     * Called after component is rendered
     */
    load() {

    }

    /**
        * 
        * @param {string} element
        * @param {any} args
        * @returns {Element | null}
    */
    async pre(element = null, args = {}) {

        try {

            this.root = await this.render();
            this.Unique("id", this.element);

            await this.init(args);

            if(element !== null) {
                document.querySelector(element).appendChild(this.root);
                this.load();
            };

            return this.root;

        }
        catch(exception) {
            console.error(`H12.Component.pre(): Unable to render or initialize the component\n${exception.stack}`);
            return null;
        };

    }
    
    /**
        * 
        * @param {any} args 
    */
    async init(args = {}) {

    }

    /**
        * 
        * @param {Component} node 
        * @param {Component[] | Function} child
        * @param {any} args
        * @returns {Component | undefined}
    */
    async component(node = null, child = [], args = {}) {

        if(node instanceof Object) {

            const _component = new node();
            _component.parent = this;
            _component.args = args;

            if(typeof(args.id) !== "undefined") {
                _component.id = args.id;
            };

            this.child[(typeof(args.id) !== "undefined") ? args.id : _component.id] = _component;

            return await _component.pre(null, args);

        };

    }

    /**
        * 
        * @param {Function} event 
        * @returns {string}
    */
    bind(event = null) {
        let _id = crypto.randomUUID();
        $fx[_id] = event.bind(this);
        return `$fx['${_id}']();`;
    }

    /**
        * 
        * @param {string} type 
        * @param {[Element | string]} child 
        * @param {Object.<string, string | Function | object | string[]>} attribute 
        * @returns {Element}
    */
    node(type = "", child = [], attribute = {}) {

        let _element = document.createElement(type);
        let _attribute = [];

        for(var i = 0, ilen = child.length; i < ilen; i++) {

            if(typeof(child[i]) === "string") {

                let _match = child[i].match(/{.*?}/g);
                if(_match == null) {

                    _element.append(document.createTextNode(child[i]));
                    continue;
                    
                };

                if(typeof(this.binding[_match[0]]) === "undefined") {
                    this.binding[_match[0]] = { element: [], data: _match[0] };
                };
                this.binding[_match[0]].element.push({ node: _element, type: 1 });

            };

            _element.append(child[i]);

        };

        for(const key in attribute) {
            
            let _value = attribute[key];
            if(Array.isArray(_value)) {
                _value = _value.join("");
            };

            if(typeof(_value) === "string") {

                /*
                if(_value.indexOf("{") !== -1 && _attribute.indexOf(key) == -1) {
                    _attribute.push(key);
                };
                */
                if(_value.indexOf("{") !== -1 && _attribute.indexOf(key) == -1) {
                    _attribute.push(key);
                };

            }
            else if(typeof(_value) === "function") {
                _value = this.bind(_value);
            }
            else if(typeof(_value) === "object") {

                for(const skey in _value) {
                    
                    let _attributeValue = ((_element.hasAttribute(skey)) ? _element.getAttribute(skey) : "") + _value[skey].toString();

                    if(_attributeValue.indexOf("{") !== -1 && _attribute.indexOf(skey) == -1) {
                        _attribute.push(skey);
                    };

                    _element.setAttribute(skey, _attributeValue);

                };

                continue;

            };

            _element.setAttribute(key, _value);

        };

        //let _unique = [...new Set(_attribute)];
        let _unique = _attribute;

        for(var i = 0, ilen = _unique.length; i < ilen; i++) {

            let _value = _element.getAttribute(_unique[i]);
            let _match = _value.match(/{.*?}/g);

            if(_match !== null) {
                for(var j = 0, jlen = (_match == null) ? 0 : _match.length; j < jlen; j++) {

                    if(typeof(this.binding[_match[j]]) === "undefined") {
                        this.binding[_match[j]] = { element: [], data: _match[i] };
                    };
                    this.binding[_match[j]].element.push({ node: _element, type: _unique[i], map: _value });

                };
            };

        };

        return _element;

    }

    /**
     * 
     * @param {string} key 
     * @param {string | number | Function} value 
     * @param {boolean} clone
    */
    Set(key = "", value = "", clone = false) {

        let _index = key.indexOf("++");
        key = key.replace("++", "");

        let _bind = this.binding[key];
        if(typeof(_bind) === "undefined") {
            return null;
        };

        if(typeof(value) === "function") {
            value = this.bind(value);
        };

        let _element = _bind.element;
        for(var i = 0, ilen = _element.length; i < ilen; i++) {

            //let _map = _element[i].map;
            //let _node = (this.root.classList.contains(_element[i].id)) ? this.root : this.root.querySelector(`.${_element[i].id}`);
            let _node = _element[i].node;

            if(_element[i].type == 1) {

                let _position = (_index == 0) ? "afterbegin" : "beforeend";
                let _clone = (value instanceof Element && clone) ? value.cloneNode(true) : value;
                let _type = (value instanceof Element) ? "insertAdjacentElement" : "insertAdjacentHTML";

                if(_index !== -1) {
                    _node[_type](_position, _clone);
                }
                else {
                    while(_node.firstChild) {
                        _node.firstChild.remove()
                    };
                    _node.append(_clone);
                };

                continue;

            }
            else {
                
                let _map = _element[i].map;
                let _match = _map.match(/{.*?}/g);

                if(_match !== null) {
                    for(var j = 0, jlen = _match.length; j < jlen; j++) {

                        if(_match[j] === key) {
                            _map = _map.replace(_match[j], value);
                            continue;
                        };

                        let _subBind = this.binding[_match[j]];
                        
                        if(typeof(_subBind) === "undefined") {
                            continue;
                        };

                        _map = _map.replace(_match[j], _subBind.data);

                    };
                };

                _node.setAttribute(_element[i].type, _map);

            };
            

        };

        _bind.data = value;

    }

    /**
        * 
        * @param {string} key 
        * @returns { null | string }
    */
    Get(key = "") {

        return typeof(this.binding[key]) === "undefined" ? null : this.binding[key].data;

    }
    
    /**
        * 
        * @param {string} unique 
        * @param {object} store 
    */
    Unique(unique = "id", store = this.element) {

        this.root.querySelectorAll(`[${unique}]`).forEach(x => {
            store[x.getAttribute(unique)] = x;
            x.setAttribute(unique, "x" + Math.random().toString(36).slice(6));
        });
        
    }

    /**
        * 
        * @param {Component} component 
        * @param {string} element 
    */
    static async Render(component = null, element = null) {
        try {
            const _component = new component();
            await _component.pre(element);
        }
        catch(exception) {
            console.error(`H12.Component.Render(): Unable to create component\n${exception.stack}`);
        };
    }
};

export default { Component };