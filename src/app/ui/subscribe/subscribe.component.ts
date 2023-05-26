import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {MqttService} from "../../services/mqtt.service";
import {Subscription} from "rxjs";
import {Message} from "paho-mqtt";

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit, OnDestroy {
  private onMessagesChanged$: Subscription | null;
  private isConnectedChanged$: Subscription;
  private onPublishedTopicsChanged$: Subscription;
  public isConnected: boolean = false;
  public isActive: boolean = false;
  messages: Message[] = [];
  public selectedTopic: string = '';
  topic: string = '';
  topics: string[] = [];
  publishedTopics: string[] = [];


  constructor(public mqttService: MqttService) {
    this.isConnectedChanged$ = this.mqttService.isConnectedChanged().subscribe(newValue => this.isConnectedChanged(newValue));
    this.onMessagesChanged$ = this.mqttService.getReceivedMessageObservable().subscribe(m => this.onReceivedMessagesChanged(m));
    this.onPublishedTopicsChanged$ = this.mqttService.getPublishedMessageObservable().subscribe(m => this.onPublishedTopicsChanged(m));
  }

  ngOnInit(): void {
  }

  private isConnectedChanged(newValue: boolean): void {
    this.isConnected = newValue;
  }

  public subscribe(): void {
    if (this.topic.trim() !== '') {
      this.mqttService.subscribe(this.topic);
    }
  }


  public onTopicChanged($event: Event): void {
    this.topic = ($event.target as HTMLInputElement).value;
  }

  public removeTopicFromList(topic: string): void {
    this.mqttService.unsubscribe(topic);
    this.messages = this.messages.filter(message => message.destinationName !== topic);
  }

  public onclick(): void {
    this.isActive = true;
  }

  unsubscribe($event: MouseEvent) {
    this.mqttService.unsubscribe(this.topic);
  }

  private onReceivedMessagesChanged(m: Message): void {
    this.selectedTopic = m.destinationName;
    this.messages.push(m);
    this.addTopicToList(m.destinationName);
  }

  private addTopicToList(topic: string): void {
    if (!this.topics.includes(topic)) {
      this.topics.push(topic);
    }
  }

  isSubscribedToTopic(topic: string): boolean {
    return this.mqttService.getTopics().includes(topic);
  }

  ngOnDestroy(): void {
    this.onMessagesChanged$?.unsubscribe();
    this.isConnectedChanged$?.unsubscribe();
  }

  onPublishedTopicChosen($event: Event) {
    this.topic = ($event.target as HTMLSelectElement).value;
  }

  private onPublishedTopicsChanged(m: Paho.MQTT.Message) {
    const topic = m.destinationName;
    if (!this.publishedTopics.includes(topic)) {
      this.publishedTopics.push(topic);
      console.log('published: ' , topic)
    }
    console.log('publishedTopics: ' , this.publishedTopics)
  }
  toggleTopicsList() {
    console.log('publishedTopics1: ' , this.publishedTopics)
    const publishedTopicsList = document.getElementById('publishedTopicsList');
    const isCollapsed = publishedTopicsList?.classList.contains('show');
    if (isCollapsed) {
      publishedTopicsList?.classList.remove('show');
    } else {
      publishedTopicsList?.classList.add('show');
    }
  }
}
