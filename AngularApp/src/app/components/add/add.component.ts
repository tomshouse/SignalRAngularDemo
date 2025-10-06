import {
    Component, 
    OnInit, OnDestroy,
    Input, Output, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CleverWareViewModelBinder, CleverWareViewModel, ViewModelInput, ViewModelOutput, ViewModelCommand } from '../../cleverWareMvvm/viewmodel';
import { Logging } from '../../cleverWareMvvm/logging';
import { SignalRService } from '../../../services/signalr.service';
import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
    styleUrls: ['./add.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddComponent extends CleverWareViewModel implements OnInit, OnDestroy {

    @Input() public InNumber1: ViewModelInput<number> = new ViewModelInput<number>();
    @Input() public InNumber2: ViewModelInput<number> = new ViewModelInput<number>();
    @Output() public OutNumber: ViewModelOutput<number> = new ViewModelOutput<number>();

    @Output() public Message: string = '';
    AddCommand: ViewModelCommand = new ViewModelCommand();
    SendCommand: ViewModelCommand<string> = new ViewModelCommand<string>();

    constructor(viewModelBinder: CleverWareViewModelBinder,
        changeDetector: ChangeDetectorRef, 
        public signalRService: SignalRService) {
        super(viewModelBinder, "SignalRAngularDemo.CleverWareRendererMvvm.AddViewModel", changeDetector, true);
        this.initialize();
    }

    ngOnInit() {
        Logging.Instance.Debug("AddComponenent ngOnInit..")();
       
        this.signalRService.addReceiveMessageListener((message:string) => {
           this.Message = message; 
           this.changeDetector.detectChanges(); // Manually trigger change detection
         });

        this.signalRService.addReceiveSumListener((sum:number) => {
           this.OutNumber.Value = sum;
           this.changeDetector.detectChanges(); // Manually trigger change detection
     }); 
    }

    ngOnDestroy() {
        this.dispose();
    }

    public AddValues() {
        // this is a new comment
         this.signalRService.AddNumbers(this.InNumber1.Value, this.InNumber2.Value);
     }
     public SendMessage(msg: string) {
        this.signalRService.SendMessage(this.id, msg);
     }

}
