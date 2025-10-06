import {
    Component,
    OnInit,
} from '@angular/core';
import { SignalRService } from '../../../services/signalr.service';
import { Router } from '@angular/router';
import { Logging } from '../../cleverWareMvvm/logging';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    title = 'my-first-app';

    constructor(private router: Router, private signalRService: SignalRService) {
      
    }

    ngOnInit() {
        this.signalRService.startConnection();
        Logging.Instance.Debug("AppComponent ngOnInit..")();
        //this.router.navigate(['add']);
        this.router.navigate(['login']);
    }
    
}
