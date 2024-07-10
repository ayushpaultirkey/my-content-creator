const TabNavigate = (index = 0, element = []) => {

    element.forEach(x => {
        x.classList.add("-left-full");
        x.classList.remove("left-0");
    });

    const _target = element[index];
    _target.classList.add("left-0");
    _target.classList.remove("-left-full");

};

export default { TabNavigate }