const _binderFunctionDict = {};

function BinderFunctionCallbackAdd(id: string, callbacks: any) {
    _binderFunctionDict[id] = callbacks;
    return id;
}

function BinderFunctionCallbackDelete(id: string) {
    delete _binderFunctionDict[id];
    return id;
}

function BinderFunctionCallback(id: string, key: string, arg1: any) {
    return _binderFunctionDict[id][key](arg1);
}

function _window(): any {
    // return the global native browser window object
    return window;
}

export class WindowRef {    
    public static Instance: WindowRef = new WindowRef();

    public binderFunctionDict: any = {};

    constructor() {
        _window().debugTag = true;
        _window().hello = 'Hello!';
        _window().BinderFunctionCallbackAdd = BinderFunctionCallbackAdd;
        _window().BinderFunctionCallbackDelete = BinderFunctionCallbackDelete;
        _window().BinderFunctionCallback = BinderFunctionCallback;
        WindowRef.Instance = this;        
    }

    public get debug() {
        return _window().debug;
    }
    
    public get jsBinder() {
      return _window().jsBinder;      
    }

    public get jsLogger() {
        return _window().jsLogger;
    } 

    public get BinderFunctionCallbackAdd() {
        return _window().BinderFunctionCallbackAdd;      
    }

    public get BinderFunctionCallbackDelete() {
        return _window().BinderFunctionCallbackDelete;
    }

    public get BinderFunctionCallback() {
        return _window().BinderFunctionCallback;
    }

    public nativeWindow(): any {
        return _window();
    }
}
