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
  private clickedSubscribedTopic: string = '';
  public filteredMessages: MqttMessage[] = [];
  public showMessagePopup: boolean = false;
  public showUnsubscribeConfirmation: boolean = false;


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
    const trimmedTopic = this.topic.trim();
    if (!!trimmedTopic && this.subscribedTopics.indexOf(this.topic) == -1) {
      this.subscribedTopics.push(this.topic);
      this.mqttService.subscribe(this.topic);
    }
  }

  public onclick(): void {
    this.isActive = true;
  }

  unsubscribe($event: string) {
    const index = this.subscribedTopics.indexOf($event);
    if (index !== -1) {
      this.subscribedTopics.splice(index, 1);
      this.mqttService.unsubscribe($event);
    }
    this.mqttService.unsubscribe($event);
  }

  public confirmUnsubscribe(): void {
    this.unsubscribe(this.selectedTopic);
    this.mqttService.updateReceivedMessages(this.messages.filter(message => message.topic !== this.selectedTopic));
    this.messages = this.mqttService.getReceivedMessages();
    this.showUnsubscribeConfirmation = false;
  }

  public cancelUnsubscribe(): void {
    this.showUnsubscribeConfirmation = false;
  }

  private onReceivedMessagesChanged(m: MqttMessage): void {
    this.selectedTopic = m.topic;
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

  public onMessageHistoryChanged($event: MqttMessage[]): void {
    const selectedMessageTimestamps = new Set<number>($event.map(message => message.timestamp));
    this.messages = this.messages.filter(message => !selectedMessageTimestamps.has(message.timestamp));
    this.mqttService.updateReceivedMessages(this.messages);
    this.messages = this.mqttService.getReceivedMessages();
  }

}
