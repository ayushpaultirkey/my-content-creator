/**
 * @type {Object<string, [import("express").Response]>}
*/
let LISTENER = {};

const Write = (task, message) => {
    if(LISTENER[task]) {
        LISTENER[task].forEach(response => {
            response.write(`data: ${JSON.stringify(message)}\n\n`);
        });
    };
};

/**
    * 
    * @param {string} task 
    * @param {import("express").Response} response 
*/
const Register = (task, response) => {

    if(!LISTENER[task]) {
        LISTENER[task] = [];
    };
    LISTENER[task].push(response);

}

/**
    * 
    * @param {string} task 
    * @param {import("express").Response} response 
*/
const Filter = (task, response) => {

    if(LISTENER[task]) {
        LISTENER[task] = LISTENER[task].filter(x => x !== response);
    };

}

export default { Write, Register, Filter };