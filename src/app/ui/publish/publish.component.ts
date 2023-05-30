import {Component, OnInit} from '@angular/core';
import {MqttService} from 'src/app/services/mqtt.service';
import {Subscription} from "rxjs";
import {MqttMessage} from "../../model/mqtt-message";

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss']
})
export class PublishComponent implements OnInit {
  private topic: string = '';
  private payload: string = '';
  public publishedMessages: MqttMessage[] = [];
  public isConnected: boolean = false;
  private isConnectedChanged$: Subscription;
  private publishedTopics: string[] = [];
  private subscribedTopics: string[] = [];
  private subscribedTopicsChanged$: Subscription;

  constructor(public mqttService: MqttService) {
    this.isConnectedChanged$ = this.mqttService.isConnectedChangedObservable().subscribe(newValue => this.isConnectedChanged(newValue));
    this.subscribedTopicsChanged$ = this.mqttService.getSubscribedTopicsObservable().subscribe(t => this.subscribedTopicsChanged(t));
  }

  public ngOnInit(): void {
    this.subscribedTopics = this.mqttService.getSubscribedTopics();
    const messages : MqttMessage[] = this.mqttService.getPublishedMessages();
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

  public onTopicChosen($event: string) : void {
    this.topic = $event;
  }
  public getFilteredTopics(): string[] {
    const topics = this.subscribedTopics.concat(this.publishedTopics);
    return [...new Set(topics)];
  }
  public onMessageHistoryChanged($event: MqttMessage[]): void {
    const selectedMessageTimestamps: Set<number> = new Set<number>($event.map(message => message.timestamp));
    this.publishedMessages = this.publishedMessages.filter(message => !selectedMessageTimestamps.has(message.timestamp));
    this.mqttService.updatePublishedMessages(this.publishedMessages);
    this.publishedMessages = this.mqttService.getPublishedMessages();
  }
}
