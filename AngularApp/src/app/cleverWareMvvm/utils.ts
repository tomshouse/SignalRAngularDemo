export class Utils {

    /**
     * Prevent func from executing more than wait milliseconds, and optionally execute immediately.
     * @param func
     * @param wait
     * @param immediate
     */
    public static debounce: (f: (a?) => void, w: number, i: boolean) => () => void = function (func: (a?) => void, wait: number, immediate: boolean) {
        var timeout;
        return function () {
            const context = this, args = arguments;
            const later = function () {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    }

}
