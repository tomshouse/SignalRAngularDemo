import {
    NgZone, Component, Inject, EventEmitter,
    OnInit, OnDestroy, AfterViewInit, OnChanges, SimpleChanges,
    Input, Output, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

    @Output() CurrentDateTime: Date;
    DateFormat: string;
    TimeFormat: string;
    private running: boolean;
    private subscriptions: any[] = [];
    private timestamp: number = 0;

    constructor(private changeDetector: ChangeDetectorRef,
        private ngZone: NgZone) {

        //this.subscriptions.push(this.vehicleStatus.CovertAlarmActive.subscribable.subscribe(result => {
        //    this.UpdateTimeFormat(result);
        //}));
        //this.subscriptions.push(this.vehicleStatus.CovertCallActive.subscribable.subscribe(result => {
        //    this.UpdateDateFormat(result);
        //}));               
    }

    get VehicleId(): number {
        return 1234; //this.vehicleStatus.VehicleId.Value;
    }

    get RunId(): string {
        return "A"; //this.vehicleStatus.RunId.Value;
    }

    get DrivingSpeedExceedsThreshold(): boolean {
        return false; //this.vehicleStatus.DrivingSpeedExceedsThreshold.Value;
    }

    get RunSwitchLockModeEnabled(): boolean {
        return false; //this.cleverWareMain.IsStarted.Value && this.vehicleStatus.RunSwitch.Value.toLowerCase() == 'false';
    }

    ngOnInit() {
        //Logging.Instance.Debug("FooterComponent ngOnInit..")();
        this.running = true;

        this.UpdateTimeFormat(false);
        this.UpdateDateFormat(false);

        this.UpdateTime(0);
    }

    ngOnDestroy() {
        //Logging.Instance.Debug("FooterComponent ngOnDestroy..")();
        for (let i = 0; i < this.subscriptions.length; i++) {
            this.subscriptions[i].unsubscribe();
        }
        this.changeDetector.detach();
        this.running = false;
    }

    UpdateTime(timestamp) {
        // timestamp is in milliseconds, updtae time every second
        if (this.timestamp + 1000 < timestamp) {
            this.timestamp = timestamp;
            this.CurrentDateTime = new Date();
            this.changeDetector.detectChanges();
        }
        if (this.running) {
            // Run outside angular so that change detection is not automatically called
            this.ngZone.runOutsideAngular(() => {
                requestAnimationFrame((DOMTimeStamp) => {
                    this.UpdateTime(DOMTimeStamp);
                });
            });
        }
    }

    UpdateTimeFormat(covertAlarmActive: boolean) {

        this.TimeFormat = covertAlarmActive ? 'HH.mm.ss' : 'HH:mm:ss';
    }

    UpdateDateFormat(covertCallActive: boolean) {

        this.DateFormat = covertCallActive ? 'MM-dd-yyyy' : 'MM/dd/yyyy';
    }

}
