function Authenticate() {
    
    // Open signup page in new window
    const _url = "/api/google/auth";
    const _window = window.open(_url, "_blank", "width=600,height=600");
    if(_window) {
        _window.focus();
    };
    
};

export default {
    Authenticate
};