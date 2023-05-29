import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {MqttService} from "../../services/mqtt.service";
import {Subscription} from "rxjs";
import {Message} from "paho-mqtt";
import {MqttMessage} from "../../model/mqtt-message";

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit, OnDestroy {
  private onReceivedMessagesChanged$: Subscription | null;
  private isConnectedChanged$: Subscription;
  private onPublishedTopicsChanged$: Subscription;
  public isConnected: boolean = false;
  public isActive: boolean = false;
  public messages: MqttMessage[] = [];
  public selectedTopic: string = '';
  private topic: string = '';
  public subscribedTopics: string[] = [];
  public publishedTopics: string[] = [];
  private clickedSubscribedTopic : string = '';
  public filteredMessages: MqttMessage[] = [];
  public showMessagePopup: boolean = false;


  constructor(public mqttService: MqttService) {
    this.isConnectedChanged$ = this.mqttService.isConnectedChangedObservable().subscribe(newValue => this.isConnectedChanged(newValue));
    this.onReceivedMessagesChanged$ = this.mqttService.getReceivedMessageObservable().subscribe(m => this.onReceivedMessagesChanged(m));
    this.onPublishedTopicsChanged$ = this.mqttService.getPublishedMessageObservable().subscribe(m => this.onPublishedTopicsChanged(m));
  }

  ngOnInit(): void {
    this.subscribedTopics = this.mqttService.getSubscribedTopics();
    this.messages = this.mqttService.getReceivedMessages();
    const publishedMessages = this.mqttService.getPublishedMessages();

    for (let i = 0; i < publishedMessages.length; i++) {
      const topic = publishedMessages[i].topic;
      if (!this.publishedTopics.includes(topic)) {
        this.publishedTopics.push(topic);
      }
    }
  }

  private isConnectedChanged(newValue: boolean): void {
    this.isConnected = newValue;
  }

  public subscribe(): void {
    console.log('tpoic: ' , this.topic)
    if (this.topic.trim() !== '') {
      this.subscribedTopics.push(this.topic);
      this.mqttService.subscribe(this.topic);
    }
  }

  public onclick(): void {
    this.isActive = true;
  }

  unsubscribe($event: string) {
    this.mqttService.unsubscribe($event);
  }

  private onReceivedMessagesChanged(m: MqttMessage): void {
    this.selectedTopic = m.topic;
    this.messages.push(m);
    this.addTopicToList(m.topic);
  }

  private addTopicToList(topic: string): void {
    if (!this.subscribedTopics.includes(topic)) {
      this.subscribedTopics.push(topic);
    }
  }

  isSubscribedToTopic(topic: string): boolean {
    return this.mqttService.getSubscribedTopics().includes(topic);
  }

  ngOnDestroy(): void {
    this.onReceivedMessagesChanged$?.unsubscribe();
    this.isConnectedChanged$?.unsubscribe();
    this.filteredMessages = [];
  }

  onPublishedTopicChosen($event: Event) {
    this.topic = ($event.target as HTMLSelectElement).value;
  }
  private updateFilteredMessages(): void {
    this.filteredMessages = this.messages.filter(message => message.topic === this.clickedSubscribedTopic);
  }

  private onPublishedTopicsChanged(m: MqttMessage) {
    const topic = m.topic;
    if (!this.publishedTopics.includes(topic)) {
      this.publishedTopics.push(topic);
    }
  }

  public onTopicChosen($event: string) {
    this.topic = $event;
  }

  public subscribedTopicClicked($event: MouseEvent) {
    const topic = ($event.target as HTMLButtonElement).innerText;
    this.clickedSubscribedTopic = topic;
    this.updateFilteredMessages();
    this.openMessagePopup();
  }
  public openMessagePopup() {
    this.showMessagePopup = true;
  }

  public closeMessagePopup() {
    this.showMessagePopup = false;
  }
  public getFilteredTopics(): string[] {
    const topics = this.subscribedTopics.concat(this.publishedTopics);
    return [...new Set(topics)];
  }

  onMessageHistoryChanged($event: MqttMessage[]) {
    // TODO
  }
}
