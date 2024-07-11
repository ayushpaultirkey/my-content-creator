const TabNavigate = (index = 0, element = []) => {

    for(var i = 0, len = element.length; i < len; i++) {
        element[i].classList.add("-left-full");
        element[i].classList.remove("left-0");
    };

    const _target = element[index];
    _target.classList.add("left-0");
    _target.classList.remove("-left-full");

};

const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) >> (c === 'x' ? 0 : 4);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
};

export default { TabNavigate, uuid }