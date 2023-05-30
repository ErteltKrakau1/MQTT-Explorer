import { Component } from '@angular/core';
import {Subscription} from "rxjs";
import {MqttService} from "./services/mqtt.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mqtt-explorer';
  isBrokerExpanded: boolean = true;
  isSubscribeExpanded: boolean = false;
  isPublishExpanded: boolean = false;
  public isConnected: boolean = false;
  private isConnectedChanged$: Subscription;

  constructor(private mqttService : MqttService) {
    this.isConnectedChanged$ = this.mqttService.isConnectedChangedObservable().subscribe(newValue => this.isConnectedChanged(newValue));
  }

  toggleBroker(): void {
    this.isBrokerExpanded = !this.isBrokerExpanded;
  }

  toggleSubscribe(): void {
    this.isSubscribeExpanded = !this.isSubscribeExpanded;
  }

  togglePublish(): void {
    this.isPublishExpanded = !this.isPublishExpanded;
  }
  private isConnectedChanged(newValue: boolean): void {
    this.isConnected = newValue;
  }
}
