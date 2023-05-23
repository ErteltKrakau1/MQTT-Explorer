import { Component } from '@angular/core';
import { MqttService } from 'src/app/services/mqtt.service';

@Component({
  selector: 'app-broker',
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.scss']
})
export class BrokerComponent {
  hostUrl: string = '';

  constructor(private mqttService: MqttService) {
    this.hostUrl = mqttService.getHostUrl();
  }

  connect() {
    this.mqttService.connect();
  }

  onHostUrlChanged($event: Event) {
    const newValue = ($event.target as HTMLInputElement).value;
    this.hostUrl = newValue;
  }

  disconnect() {
    this.mqttService.disconnect();
  }
}
