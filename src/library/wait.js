export default class wait {
    constructor() {
        this.reject = null;
        this.resolve = null;
        this.promise = new Promise((res, rej) => {
            this.reject = rej;
            this.resolve = res;
        });
    }
};