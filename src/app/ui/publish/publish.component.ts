import { Component } from '@angular/core';
import { MqttService } from 'src/app/services/mqtt.service';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss']
})
export class PublishComponent {
  topic: string = '';
  payload: string = '';


  constructor(public mqttService: MqttService) {
  }

  publish() {
    this.mqttService.sendMessage(this.topic, this.payload);
  }


  onTopicChanged($event: Event) {
    const newValue = ($event.target as HTMLInputElement).value;
    this.topic = newValue;
  }

  onPayloadChanged($event: Event) {
    const newValue = ($event.target as HTMLInputElement).value;
    this.payload = newValue;
  }
}
