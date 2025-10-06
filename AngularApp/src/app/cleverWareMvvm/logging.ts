import { WindowRef } from './windowRef';
import { environment } from '../../../src/environments/environment';

export enum LogLevel
{
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
    Event = 5
}

export class Logging {
    public name: string = "CleverWareLogging";
    private static _instance: Logging = null;
    public jsLogger: any = null;
    private logLevel: number = 1;
    private addlinenumber: boolean = false;

    private clr_debug: (obj: any) => {};
    private clr_info: (obj: any) => {};
    private clr_warn: (obj: any) => {};
    private clr_error: (obj: any) => {};
    private clr_event: (obj: any) => {};
    private clr_logLevel: (obj: any) => {};
    private console = window.console;


    private constructor() {               
        console.log("Logging constructor in logging.ts");      
        
        //jsBinder access to C#
        //this.jsBinder = WindowRef.Instance.jsBinder;
        if (WindowRef.Instance.jsLogger === undefined) {
            console.log("Failed to Load jsLogger");
            this.jsLogger = new JsLoggerMock();
        } else {
            this.jsLogger = WindowRef.Instance.jsLogger;         
        }
                
        // Calling into C# DLL
        //public Task<object> Initialize(dynamic obj);
        this.clr_debug = (obj: any) => {
            try {
                return JSON.parse(this.jsLogger.debug(JSON.stringify(obj)));
            } catch (err) {
                console.log(err)
            }
        };

        this.clr_info = (obj: any) => {
            try {
                return JSON.parse(this.jsLogger.info(JSON.stringify(obj)));
            } catch (err) {
                console.log(err)
            }
        };

        this.clr_warn = (obj: any) => {
            try {
                return JSON.parse(this.jsLogger.warn(JSON.stringify(obj)));
            } catch (err) {
                console.log(err)
            }
        };

        this.clr_error = (obj: any) => {
            try {
                return JSON.parse(this.jsLogger.error(JSON.stringify(obj)));
            } catch (err) {
                console.log(err)
            }
        };

        this.clr_event = (obj: any) => {
            try {
                return JSON.parse(this.jsLogger.event(JSON.stringify(obj)));
            } catch (err) {
                console.log(err)
            }
        };

        this.clr_logLevel = (obj: any) => {
            try {
                return JSON.parse(this.jsLogger.logLevel(JSON.stringify(obj)));
            } catch (err) {
                console.log(err)
            }
        };
               
        this.logLevel = this.check(this.clr_logLevel(JSON.stringify({ level: 1 })));
        console.debug("Log Level = " + this.logLevel + " (1:Debug 2:Info 3:Warn 4:Error 5:Event)");                    
    }

    public static get Instance (): Logging {
        if (Logging._instance == null) {
            Logging._instance = new Logging();            
        }
        return Logging._instance;
    }

    public Debug(msg: string): Function {
        try {
            this.clr_debug({
                message: msg.toString()
            });
        } catch (ex) {
            console.exception(ex);
        }

        if (this.logLevel <= LogLevel.Debug) {   
            if (this.addlinenumber) {
                const callerLine = new Error().stack.split('\n')[2];
                console.debug(this.createMessagePre('Debug'), this.clipMessage(msg), callerLine);
                return () => { };
            } else {                
                return console.debug.bind(console, this.createMessagePre('Debug'), this.clipMessage(msg));               
            }   
        } else {
            return () => { };
        } 
    }       

    public Info(msg: string) {
        try {
            this.clr_info({
                message: msg.toString()
            });
        } catch (ex) {
            console.exception(ex);
        }

        if (this.logLevel <= LogLevel.Info) {
            if (this.addlinenumber) {
                var callerLine = new Error().stack.split('\n')[2];
                console.info(this.createMessagePre('Info'), this.clipMessage(msg), callerLine);
                return () => { };
            } else {
                return console.info.bind(console, this.createMessagePre('Info'), this.clipMessage(msg));            
            }   
        } else {
            return () => { };
        }
    }   

    public Warn(msg: string) {
        try {
            this.clr_warn({
                message: msg.toString()
            });
        } catch (ex) {
            console.exception(ex);
        }
         
        if (this.logLevel <= LogLevel.Warn) {
            if (this.addlinenumber) {
                var callerLine = new Error().stack.split('\n')[2];
                console.warn(this.createMessagePre('Warn'), this.clipMessage(msg), callerLine);
                return () => { };
            } else {        
                return console.warn.bind(console, this.createMessagePre('Warn'), this.clipMessage(msg));        
            }   
        } else {
            return () => { };
        }
    }   

    public Error(msg: string) {
        try {            
            this.clr_error({
                message: msg.toString()
            });
        } catch (ex) {
            console.exception(ex);
        }

        if (this.logLevel <= LogLevel.Error) {
            if (this.addlinenumber) {
                var callerLine = new Error().stack.split('\n')[2];
                console.error(this.createMessagePre('Error'), this.clipMessage(msg), callerLine);
                return () => { };
            } else {            
                return console.error.bind(console, this.createMessagePre('Error'), this.clipMessage(msg));            
            }   
        } else {
            return () => { };
        }
    }   

    public Event(msg: string) {
        try {
            this.clr_event({
                message: msg.toString()
            });
        } catch (ex) {
            console.log(ex);
        }

        if (this.logLevel <= LogLevel.Event) {
            if (this.addlinenumber) {
                var callerLine = new Error().stack.split('\n')[2];
                console.log(this.createMessagePre('Event'), this.clipMessage(msg), callerLine);
                return () => { };
            } else {            
                return console.log(console, this.createMessagePre('Event'), this.clipMessage(msg));            
            }   
        } else {
            return () => { };
        }
    }   

    public ButtonCommand(componentName: string, button: string, key_value: string) {
        if (key_value) {
            this.Info(componentName + " - User Pressed " + button + " (" + key_value + ")");
        } else {
            this.Info(componentName + " - User Pressed " + button);
        }
    }
       
    private check(result: any): any {
        try {
            if (!result.ok) {
                throw result.result;
            } else {
                return result.result;
            }
        } catch (ex) {         
            console.exception(ex);            
        }
    }

    private logResults(err, result, message) {
        try {
            let obj = this.check(result);
            if (!obj) {
                console.error("LOGGING: Logging in C# has not been setup: ", message);
            }
        } catch (ex) {
            console.exception(ex);
        }
    }

    private clipMessage(message: string): string {        
        if (message.length > 256) {
            return message.substr(0, 256) + '...';
        } else {
            return message;
        }
    }
    
    private createMessagePre(level): string {
        let date = new Date();
        let yyyymmdd = date.getFullYear() + '-' + this.pad(date.getMonth() + 1, 2) + '-' + this.pad(date.getDate(), 2);
        let HHmmssfff = this.pad(date.getHours(), 2) + ":" + this.pad(date.getMinutes(), 2) + ":" + this.pad(date.getSeconds(), 2) + "." + this.pad(date.getMilliseconds(), 3);
        return yyyymmdd + '|' + HHmmssfff + '|' + level + '|' ;        
    }

    private pad(num, size):string {
        var s = "000000000000" + num;
        return s.substr(s.length - size);
    }
}

export class JsLoggerMock {

    public debug(): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

    public info(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

    public warn(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

    public error(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

    public event(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

    public logLevel(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }
}
