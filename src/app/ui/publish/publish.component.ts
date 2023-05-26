import {Component} from '@angular/core';
import {MqttService} from 'src/app/services/mqtt.service';
import {Message} from "paho-mqtt";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss']
})
export class PublishComponent {
  topic: string = '';
  payload: string = '';
  publishedMessagesChanged$ : Subscription;
  publishedMessages: Message[] = [];
  isConnected : boolean = false;
  isConnectedChanged$ : Subscription;

  constructor(public mqttService: MqttService) {
    this.publishedMessagesChanged$ = this.mqttService.getPublishedMessagesChanged().subscribe(m => this.onPublishedMessagesChanged(m))
    this.isConnectedChanged$ = this.mqttService.isConnectedChanged().subscribe(newValue => this.isConnectedChanged(newValue));

  }
  private isConnectedChanged(newValue : boolean): void{
    this.isConnected = newValue;
  }

  public publish(): void {
    this.mqttService.sendMessage(this.topic, this.payload);
  }


  public onTopicChanged($event: Event): void {
    this.topic = ($event.target as HTMLInputElement).value;
  }

  public onPayloadChanged($event: Event): void {
    this.payload = ($event.target as HTMLInputElement).value;
  }

  private onPublishedMessagesChanged(m: Paho.MQTT.Message): void {
    this.publishedMessages.push(m);
  }
}
