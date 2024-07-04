const DATA = {};

function Get(id) {
    
    if(id && DATA[id]) {
        return DATA[id];
    };
    return false;

};

function Set(id, value) {
    if(id) {
        DATA[id] = value;
    };
}

function Remove(id) {
    delete DATA[id];
}

export default { Get, Set, Remove };
