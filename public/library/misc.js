const TabNavigate = (index = 0, element = []) => {

    for(var i = 0, len = element.length; i < len; i++) {
        element[i].classList.add("-left-full");
        element[i].classList.remove("left-0");
    };

    const _target = element[index];
    _target.classList.add("left-0");
    _target.classList.remove("-left-full");

};

export default { TabNavigate }