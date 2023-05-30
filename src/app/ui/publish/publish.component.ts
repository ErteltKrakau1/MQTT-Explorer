import {Component, OnInit} from '@angular/core';
import {MqttService} from 'src/app/services/mqtt.service';
import {Message} from "paho-mqtt";
import {Subscription} from "rxjs";
import {MqttMessage} from "../../model/mqtt-message";

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss']
})
export class PublishComponent implements OnInit {
  topic: string = '';
  payload: string = '';
  publishedMessagesChanged$: Subscription;
  publishedMessages: MqttMessage[] = [];
  isConnected: boolean = false;
  isConnectedChanged$: Subscription;
  publishedTopics: string[] = [];
  subscribedTopics: string[] = [];
  subscribedTopicsChanged$: Subscription;

  constructor(public mqttService: MqttService) {
    this.publishedMessagesChanged$ = this.mqttService.getPublishedMessagesChanged().subscribe(m => this.onPublishedMessagesChanged(m))
    this.isConnectedChanged$ = this.mqttService.isConnectedChangedObservable().subscribe(newValue => this.isConnectedChanged(newValue));
    this.subscribedTopicsChanged$ = this.mqttService.getSubscribedTopicsObservable().subscribe(t => this.subscribedTopicsChanged(t));
  }

  ngOnInit(): void {
    this.subscribedTopics = this.mqttService.getSubscribedTopics();
    const messages = this.mqttService.getPublishedMessages();
    this.publishedMessages = messages;
    for(let i = 0; i < messages.length; i++){
      const topic = messages[i].topic;
      this.publishedTopics.push(topic);
    }
  }

  private subscribedTopicsChanged(t : string) {
    this.subscribedTopics.push(t);
  }

  private isConnectedChanged(newValue: boolean): void {
    this.isConnected = newValue;
  }

  public publish(): void {
    this.publishedTopics.push(this.topic);
    this.mqttService.sendMessage(this.topic, this.payload);
  }

  public onPayloadChanged($event: Event): void {
    this.payload = ($event.target as HTMLInputElement).value;
  }

  private onPublishedMessagesChanged(m: MqttMessage): void {
    this.publishedMessages.push(m);
  }


  public onTopicChosen($event: string) {
    this.topic = $event;
  }
  public getFilteredTopics(): string[] {
    const topics = this.subscribedTopics.concat(this.publishedTopics);
    return [...new Set(topics)];
  }
  public onMessageHistoryChanged($event: MqttMessage[]): void {
    const selectedMessageTimestamps = new Set<number>($event.map(message => message.timestamp));
    this.publishedMessages = this.publishedMessages.filter(message => !selectedMessageTimestamps.has(message.timestamp));
    this.mqttService.updatePublishedMessages(this.publishedMessages);
    this.publishedMessages = this.mqttService.getReceivedMessages();
  }
}
