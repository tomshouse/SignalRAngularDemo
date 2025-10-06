import { Injectable, ChangeDetectorRef, ApplicationRef } from '@angular/core';
//import { WindowRef } from './windowRef';
import { Logging } from './logging';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { SignalRService } from 'src/services/signalr.service';
import { v4 as uuidv4 } from 'uuid';

let verboseConsoleLog = false;

@Injectable()
export class CleverWareViewModelBinder {
    public typeName: string = "CleverWareViewModelBinder";
    public jsBinder: any = null;
    private logLevel: number = 1;

    // Will be set to true via CleverWareMainViewModel.IsStarted
    private appStarted = true;
    private viewModelQueue?: Array<CleverWareViewModel> = new Array<any>();

    public clr_initialize: () => any = () => {};
    public clr_createViewModel: (obj: any) => any = (obj: any) => {};
    public clr_destroyViewModel: (obj: any) => any = (obj: any) => { };
    public clr_getPropertyValue: (obj: any) => any = (obj: any) => { };
    public clr_getPropertyAsViewModel: (obj: any) => any = (obj: any) => { };
    public clr_setPropertyValue: (obj: any) => any = (obj: any) => { };
    public clr_bindToProperty: (obj: any) => any = (obj: any) => { };
    public clr_executeCommand: (obj: any) => any = (obj: any) => { };

    constructor(public applicationRef: ApplicationRef, signalRService: SignalRService) {
        Logging.Instance.Debug("CleverWareViewModelBinder constructor")();
         


        //jsBinder access to C#
        //this.jsBinder = WindowRef.Instance.jsBinder;
        //if (WindowRef.Instance.jsBinder === undefined) {
           // Logging.Instance.Error("Failed to Load jsBinder");
           // this.jsBinder = new JsBinderMock();
       //} else {
            //this.jsBinder = WindowRef.Instance.jsBinder;            
       //}
       

        // Calling into C#

        //public string Initialize(string);
        this.clr_initialize = () => {
            
            //try {
                //return JSON.parse(this.jsBinder.initializeBinder());
            //} catch (err) {
                //console.log(err)
            //}
        };

        //public string CreateViewModel(string);
        this.clr_createViewModel = (obj: any) => {
            try {
                signalRService.CreateViewModelRequest(obj.name,obj.id);       

            } catch (err) {
                console.log(err);
            }
        };

        //public string DestroyViewModel(string );
        this.clr_destroyViewModel = (obj: any) => {
            try {
                signalRService.DestroyViewModelRequest(obj.id);   

            } catch (err) {
                console.log(err);
            }
        };

        //public string GetPropertyValue(string);
        this.clr_getPropertyValue = (obj: any) => {
            try {
                return JSON.parse(this.jsBinder.getPropertyValue(JSON.stringify(obj)));
            } catch (err) {
                console.log(err);
            }
        };

        //public string GetPropertyAsViewModel(string);
        this.clr_getPropertyAsViewModel  = (obj: any) => {
            try {
                signalRService.GetPropertyAsViewModelRequest(obj.id, obj.property, obj.childId);
            } catch (err) {
                console.log(err);
            }
        };

        //public string SetPropertyValue(string);
        this.clr_setPropertyValue = (obj: any) => {
            try {   
                signalRService.SetPropertyValueRequest(obj.id, obj.property, obj.value);             
            } catch (err) {
                console.log(err);
            }
        };

        //public string BindToProperty(string);
        this.clr_bindToProperty = (obj: any) => {
            try {
                signalRService.BindToPropertyRequest(obj.id, obj.property, obj.onChanged, obj.callback);
            } catch (err) {
                console.log(err);
            }
        };

        //public string ExecuteCommand(string);
        this.clr_executeCommand = (obj: any) => {
            try {
                return JSON.parse(this.jsBinder.executeCommand(JSON.stringify(obj)));
            } catch (err) {
                console.log(err);
            }
        };

        this.clr_initialize();
    }

   
    public CreateViewModel(vmName: string, id: string): void {
        this.clr_createViewModel({ name: vmName, id: id });
    }

    public SetupWaitForAppStart(started: ViewModelOutputBehaviorSubject<boolean>) {
        started.subscribable.subscribe((next) => {
            if (next) {
                // Bind all the view models in the queue and then discard references
                this.appStarted = true;
                this.viewModelQueue.forEach((vm) => vm.bind());
                this.viewModelQueue = null;
            }
        });
    }

    public AppStartInitialViewModel(vm: CleverWareViewModel) {
        if (this.appStarted) {
            vm.bind();
        } else {
            this.viewModelQueue.push(vm);
        }
    }
}

export class CleverWareViewModel {
    public tyepName: string = "CleverWareViewModel";

    protected subscriptions: Subscription[] = [];
    protected callbacks: any = {};
    protected callbackIndexer: number = 1;

    public id: string = null
    private bound: boolean = false;
    private tickDelay: number = 30;
    private tick: Function;

    public constructor(private binder: CleverWareViewModelBinder,
       public viewModelClassName: string = null,
        protected changeDetector: ChangeDetectorRef,
        protected pushStrategy: boolean = false,
        protected parentId: number = -1,
        protected childPropertyName: string = null,
        protected signalRService: SignalRService = null
    ) {

        if (this.parentId !== -1 && this.childPropertyName !== null && this.viewModelClassName === null) {
            this.viewModelClassName = "ChildViewModel-" + this.childPropertyName + "-" + this.parentId;
        }

        if (verboseConsoleLog) {
            Logging.Instance.Debug("CleverWareViewModel " + this.viewModelClassName + " constructor.")();
        }

        this.id = uuidv4()

        // Setup VM
        if (this.parentId === -1 && this.childPropertyName === null) {
            
            this.binder.CreateViewModel(viewModelClassName,  this.id );
        } else {
            this.binder.clr_getPropertyAsViewModel({ id: this.parentId, property: this.childPropertyName, childId: this.id });
        }

        this.setupTick();
    }

    public initialize(started: ViewModelOutputBehaviorSubject<boolean> = null): void {
        
        //if (started) {
            this.bind();
            //this.binder.SetupWaitForAppStart(started);
        //} else {
            //this.binder.AppStartInitialViewModel(this);
        //}
        if (verboseConsoleLog) {
            Logging.Instance.Debug("CleverWareViewModel " + this.viewModelClassName + " initialized.")();
        }   

        this.signalRService.OnPropertyChangedListener((id: string, property:string, value: string ) => {
            console.log("CleverWareViewModelBinder OnPropertyChangedListener id:" + id + " property:" + property + " value:" + value + "oldPropertyValue:" + this[property]); 
            this[property] = value;
            console.log("CleverWareViewModelBinder OnPropertyChangedListener id:" + id + " newpropertyvalue:" + property + " value:" + this[property]); 
        });      
    }

    public bind(): void {
        if (this.bound) {
            Logging.Instance.Error('CleverWareViewModel already bound: ' + this.viewModelClassName)();
        } else {
            this.bound = true;
            this.bindProperties();
        }
    }

    public addSubscription(subscription: Subscription): void {
        this.subscriptions.push(subscription);
    }

    public dispose(): void {
        // Unsubscribe
        this.clearSubscriptions();

        // Detach change detection ref
        if (this.changeDetector) {
            this.changeDetector.detach();
            this.changeDetector = null;
        }

        // Stop anything from calling
        this.tick = (useChangeDetection) => { }

        // Destroy VM        
        this.binder.clr_destroyViewModel({ id: this.id });

        // Destroy callbacks
        this.deletCallbacks();

        // Remove reference to callbacks
        //WindowRef.Instance.BinderFunctionCallbackDelete(this.id.toString());
       
        if (verboseConsoleLog) {
            Logging.Instance.Debug("CleverWareViewModel " + this.viewModelClassName + " disposed.")();
        }
    }

    public get isBound(): boolean {
        return this.bound;
    }

    private addCallback(func: any): string {
        const key = this.id + '_callback_' + this.callbackIndexer++;
        this.callbacks[key] = func;
        return key;
    }

    private deletCallbacks(): void {
        Object.keys(this.callbacks).forEach((key) => {
            delete this.callbacks[key];
        });
    }

    private setupTick() {
        // Setup change detection for strategy       
        if (this.changeDetector) {
            if (this.pushStrategy) {
                this.tick = (useChangeDetection) => {
                    setTimeout(() => {
                        if (useChangeDetection && this.changeDetector) {
                            this.changeDetector.markForCheck();
                            this.changeDetector.detectChanges();
                        }
                    }, this.tickDelay);
                };
            } else {
                this.tick = (useChangeDetection) => {
                    setTimeout(() => {
                        if (useChangeDetection && this.changeDetector) {
                            this.changeDetector.detectChanges();
                        }
                    }, this.tickDelay);
                };
            }
        } else {
            this.tick = (useChangeDetection) => {
                setTimeout(() => {
                    if (useChangeDetection) {
                        this.binder.applicationRef.tick();
                    }
                }, this.tickDelay);
            };
        }
    }

    private clearSubscriptions() {
        // Unsubscribe
        for (let i = 0; i < this.subscriptions.length; i++) {
            this.subscriptions[i].unsubscribe();
        }
        // clean array
        while (this.subscriptions.length) {
            this.subscriptions.pop();
        }
    }

    private bindProperties(): void {

        // Add callback now so available during binding, funcs will be added to this.callback
        //WindowRef.Instance.BinderFunctionCallbackAdd(this.id.toString(), this.callbacks);

        let inputs: string[] = this.getAllPropertiesOfType("ViewModelInput");
        if (verboseConsoleLog) {
            Logging.Instance.Debug("CleverWareViewModel " + this.viewModelClassName + " Binding inputs: " + inputs)();
        }
        inputs.forEach(prop => {
            this.bindInput(prop);
        });

        let outputs: string[] = this.getAllPropertiesOfType("ViewModelOutput");
        if (verboseConsoleLog) {
            Logging.Instance.Debug("CleverWareViewModel " + this.viewModelClassName + " Binding outputs: " + outputs)();
        }
        outputs.forEach(prop => {
            this.bindOutput(prop);
        });

        let subscribedOutputs: string[] = this.getAllPropertiesOfType("ViewModelOutputBehaviorSubject");
        if (verboseConsoleLog) {
            Logging.Instance.Debug("CleverWareViewModel " + this.viewModelClassName + " Binding subscribedOutputs: " + subscribedOutputs)();
        }
        subscribedOutputs.forEach(prop => {
            this.bindOutput(prop);
        });

        let commands: string[] = this.getAllPropertiesOfType("ViewModelCommand");
        if (verboseConsoleLog) {
            Logging.Instance.Debug("CleverWareViewModel " + this.viewModelClassName + " Binding commands: " + commands)();
        }
        commands.forEach(prop => {
            this.bindCommand(prop);
        });

        let children: string[] = this.getAllPropertiesOfType("ViewModelChildViewModel");
        if (verboseConsoleLog) {
            Logging.Instance.Debug("CleverWareViewModel " + this.viewModelClassName + " Binding children: " + children)();
        }
        children.forEach(prop => {
            this[prop].bind(prop);
        });        
    }

    private fetchFromObject(obj, prop) {
        if (typeof obj === 'undefined') {
            return false;
        }

        var _index = prop.indexOf('.')
        if (_index > -1) {
            return this.fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
        }

        return obj[prop];
    }

    private getAllPropertiesOfType(objtypename: string): string[] {
        let props: string[] = [];
        try {
            let obj: any = this;
            do {

                let listed = Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()));
                let sorted = listed.sort();
                let filtered = sorted.filter((p, i, arr) =>
                    obj[p] !== null && //property object not null or not undefined
                    obj[p] !== undefined &&
                    obj[p].typeName !== null && //constructor not null or not undefined
                    obj[p].typeName !== undefined &&
                    obj[p].typeName === objtypename &&  //is of type                      
                    (i == 0 || p !== arr[i - 1]) &&  //not overriding in this prototype
                    props.indexOf(p) === -1          //not overridden in a child
                );
                props = props.concat(filtered);
            }
            while (
                (obj = Object.getPrototypeOf(obj)) &&   //walk-up the prototype chain
                Object.getPrototypeOf(obj)              //not the the Object prototype methods (hasOwnProperty, etc...)
            )
        } catch (ex) {
            Logging.Instance.Error(ex)();
        }

        return props
    }

    private bindOutput(propertyName) {
        // Setup to get changes from C#  
        this.binder.clr_bindToProperty({
            id: this.id,
            property: propertyName,
            onChanged: this.addCallback((input) => {
                try {
                    if (verboseConsoleLog) {
                        Logging.Instance.Debug('CleverWareViewModel OUTPUT <- onChange - ' + propertyName + ':' + input)();
                    }
                    this[propertyName].OnChanging();
                    if (this[propertyName].Value !== input) {
                        this[propertyName].Value = input;
                        this.tick(this[propertyName].useChangeDetection);
                    }
                    this[propertyName].OnChanged();                   
                } catch (ex) {
                    Logging.Instance.Error('bindOutput ' + propertyName + ' onChanged ' + ex)();
                }
            }),
            callback: this.addCallback((result) => {
                try {
                    const value = result;
                    if (verboseConsoleLog) {
                        Logging.Instance.Debug('CleverWareViewModel OUTPUT <- Initialize - ' + propertyName + ':' + value)();
                    }
                    // Use Value so if Subcritpion is set all are hook ups are called.
                    this[propertyName].Value = value;
                    Logging.Instance.Debug('bindOutput setting Property: ' + propertyName + '=' + value);
                    this.tick(this[propertyName].useChangeDetection);
                } catch (ex) {
                    Logging.Instance.Error('bindOutput ' + propertyName + ' result ' + ex)();
                }
            })
        });             
    }

    private bindCommand(propertyName) {
        this[propertyName].Command = (param) => {
            try {
                if (verboseConsoleLog) {
                    Logging.Instance.Debug('CleverWareViewModel COMMAND -> executeCommand - ' + propertyName)();
                }
                this.binder.clr_executeCommand({
                    id: this.id,
                    command: propertyName,
                    onComplete: this.addCallback((input) => {
                        if (verboseConsoleLog) {
                            Logging.Instance.Debug('CleverWareViewModel COMMAND <- onComplete - ' + propertyName + 'called.')();
                        }
                        this[propertyName].OnComplete();                        
                    }),
                    parameter: param,
                    callback: this.addCallback((output) => {
                        const result = JSON.parse(output);
                        if (!result.ok) {
                            Logging.Instance.Error(propertyName + ' Call Failed!')();
                        }
                        
                    })
                })
            } catch (ex) {
                Logging.Instance.Error('bindCommand ' + propertyName + ' ' + ex)();
            }
        }
    }

    private bindInput(propertyName) {
        // Get if variable is initialized in C#
        let initialized: boolean = this[propertyName].Value !== null && this[propertyName].Value !== undefined;

        // Setup to get changes from C#
        this.binder.clr_bindToProperty({
            id: this.id,
            property: propertyName,
            onChanged: this.addCallback((input) => {
                try {
                    if (verboseConsoleLog) {
                        Logging.Instance.Debug('CleverWareViewModel INPUT <- onChange -' + propertyName + ':' + input)();
                    }
                    if (this[propertyName].Value !== input) {
                        this[propertyName].OnChanging();
                        this[propertyName].OnChangeUpdate(input);
                        this.tick(this[propertyName].useChangeDetection);
                        this[propertyName].OnChanged();
                    }                    
                } catch (ex) {
                    Logging.Instance.Error('bindInput ' + propertyName + ' onChange ' + ex)();
                }
            }),
            callback: this.addCallback((result) => {
                try {
                    if (this[propertyName].value === null || this[propertyName].value === undefined) {
                        const value = result
                        if (verboseConsoleLog) {
                            Logging.Instance.Debug('CleverWareViewModel INPUT <- Initialize - ' + propertyName + ':' + value)();
                        }
                        // Do lowercase value because we do not want to call OnSetChange
                        this[propertyName].value = value;
                        this.tick(this[propertyName].useChangeDetection);
                    } else {
                        const value = (this[propertyName].value !== null) ? this[propertyName].value.toString() : null;
                        this.binder.clr_setPropertyValue({
                            id: this.id.toString(),
                            property: propertyName.toString(),
                            value: value,
                            callback: this.addCallback((result) => {
                                try {
                                    if (verboseConsoleLog) {
                                        Logging.Instance.Debug('CleverWareViewModel INPUT -> Initialize - ' + propertyName + ':' + value)();
                                    }
                                } catch (ex) {
                                    Logging.Instance.Error('bindInput ' + propertyName + ' result ' + ex)();
                                }
                            })
                        });
                    }
                } catch (ex) {
                    Logging.Instance.Error('bindInput ' + propertyName + ' result ' + ex)();
                }
            })
        });

        // Set value to c#
        this[propertyName].OnSetChange = (e: any) => {
            try {
                if (e !== undefined) {
                    const value = (e !== null) ? e.toString() : null;
                    this.binder.clr_setPropertyValue({
                        id: this.id.toString(),
                        property: propertyName.toString(),
                        value: value,
                        callback: this.addCallback((result) => {
                            try {
                                if (verboseConsoleLog) {
                                    Logging.Instance.Debug('CleverWareViewModel INPUT -> OnSetChange - ' + propertyName + ':' + value)();
                                }
                                this[propertyName].OnSet(value);
                                this.tick(this[propertyName].useChangeDetection);
                            } catch (ex) {
                                Logging.Instance.Error('bindInput ' + propertyName + ' OnSetChange ' + ex)();
                            }
                        })
                    });
                } else {
                    Logging.Instance.Debug('CleverWareViewModel::OnSetChange to C# ignored for property whose value is currently undefined:' + propertyName.toString())();
                }
            } catch (ex) {
                Logging.Instance.Error('bindInput ' + propertyName + ' OnSetChange ' + ex)();
            }
        }
    }

    private isDescendant(parent, child) {
        var node = child.parentNode;
        while (node != null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }
}

export class ViewModelOutput<T = Object> {
    public typeName: string = "ViewModelOutput";
    public useChangeDetection: boolean = true;
    protected value: T;

    constructor(value?: T) {
        if (value !== undefined) {
            this.value = value;
        }
    }

    public set Value(value: T) {
        if (this.value != value) {
            this.value = value;
        }
    }

    public get Value(): T {
        return this.value;
    }

    public toString = (): string => {
        if (this.value == null || this.value === undefined) {
            return "";
        } else {
            return this.value.toString();
        }
    }

    public OnChangeUpdate(value: T) {
        this.Value = value;
    }

    public OnChanging() {
        // Place holder to possibly be overwritten        
    }

    public OnChanged() {
        // Place holder to possibly be overwritten        
    }

}

export class ViewModelInput<T = Object> {
    public typeName: string = "ViewModelInput";
    public useChangeDetection: boolean = true;
    private value: T;
    private setting: boolean = false;
    public name: string = "unknown";
    private getting: boolean = false;
    protected Id: string = null;

    constructor(value?: T) {
        this.name = this.constructor.name;
        if (value) {
            this.value = value;
        }
    }

    public set Value(value: T) {
        if (this.value != value) {
            this.setting = true;
            this.value = value;
            this.OnSetChange(value);
        }
    }

    public get Value(): T {
        return this.value;
    }

    public toString = (): string => {
        if (this.value === null || this.value === undefined) {
            return "";
        } else {
            return this.value.toString();
        }
    }

    public OnChangeUpdate(value: T) {
        if (!this.setting) {
            this.value = value;
        }
    }

    public OnSetChange(value: T) {
        // Place holder to be overwritten
        Logging.Instance.Error(this.name + ' ViewModelInput:OnSetChange Not Set!')();
    }

    public OnSet(value: T) {
        this.setting = false;
        this.OnSetComplete();
    }

    public OnSetComplete() {
        // Place holder to possibly be overwritten    
    }

    public OnChanging() {
        // Place holder to possibly be overwritten        
    }

    public OnChanged() {
        // Place holder to possibly be overwritten        
    }

}

export class ViewModelOutputBehaviorSubject<T = Object> extends ViewModelOutput<T> {
    public typeName: string = "ViewModelOutputBehaviorSubject";
    public useChangeDetection: boolean = true;
    private subject: BehaviorSubject<T> = new BehaviorSubject<T>(undefined);
    public subscribable = this.subject.asObservable();

    constructor(value?: T, callback?: (next: T) => void) {
        super(value);
        this.subject.next(this.value);
        if (callback !== undefined) {
            this.subscribable.subscribe(next => callback(next));
        }
    }

    public set Value(value: T) {
        if (this.Value != value) {
            this.value = value;
            this.subject.next(this.value);
        }
    }

    public get Value(): T {
        return this.value;
    }
}

export class ViewModelCommand<T = Object> {
    public typeName: string = "ViewModelCommand";
    public useChangeDetection: boolean = true;
    private mouseDown: any = null;
    public Interval: number = 1000;

    constructor(private ignoreBindError = false) {
    }

    public Command(parameter: T = null) {
        // Place holder to be overwritten
        if (!this.ignoreBindError) {
            Logging.Instance.Error('ViewModelCommand:Command Not Set!')();
        }
    }

    public OnComplete() {
        // Place holder to possibly be overwritten        
    }

    public HandleMouseDown() {
        if (this.mouseDown === null) {
            this.Command();
            this.mouseDown = setInterval(() => {
                this.Command();
            }
                , this.Interval);
        }
    }

    public HandleMouseUp() {
        clearInterval(this.mouseDown);
        this.mouseDown = null;
    }
}

export class ViewModelChildViewModel<T> {
    public tyepName: string = "ViewModelChildViewModel";
    public useChangeDetection: boolean = true;
    public ViewModel: T = null;
    public id: number;

    constructor(string, private viewModelType: new (parentId: number, childPropertyName: string) => T) {
        if (this.ViewModel instanceof CleverWareViewModel) {
            Logging.Instance.Error("ViewModelChildViewModel type is not a CleverWareViewModel!")();
        }
    }

    public bind(propertyName) {
        if (this.ViewModel instanceof CleverWareViewModel) {
            this.ViewModel = new this.viewModelType(this.id, propertyName);
        }
    }
}

export class JsBinderMock {

    public initializeBinder(): string {
        let result = { ok: true, result: true }; 
        return JSON.stringify(result);
    }

    public createViewModel(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

    public destroyViewModel(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

    public getPropertyValue(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

    public getPropertyAsViewModel(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

    public setPropertyValue(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

    public bindToProperty(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

    public executeCommand(obj: string): string {
        let result = { ok: true, result: true };
        return JSON.stringify(result);
    }

}
