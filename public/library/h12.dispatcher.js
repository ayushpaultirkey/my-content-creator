/**
    * Dispatcher object used to dispatch multiples events across components based on event name
    * @property `Target` `EventTarget`
    * @property `On` `function`
    * @property `Call` `function`
*/
const Dispatcher = {};

Dispatcher.target = new EventTarget();

/**
    * The function will be called when the `Disptacher.Call()` function is called based on the event name
    * @param `name` `string` Name of the event
    * @param `callback` `function` Event that will be called that have `event` and `event.detail` as arguments
*/
Dispatcher.on = function(name = "", callback = null) {

    if(name.length > 0 && callback !== null) {
        Dispatcher.target.addEventListener(name, (event) => { callback(event, event.detail) }, true);
    };

};

/**
    * Dispatch any named event with arguments
    * @param name `string` Name of the event
    * @param argument `any`
*/
Dispatcher.call = function(name = "", argument = null) {

    if(name.length > 0) {
        Dispatcher.target.dispatchEvent(new CustomEvent(name, { detail: argument }));
    };

};


export default Dispatcher;