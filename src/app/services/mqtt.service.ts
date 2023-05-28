import {Injectable} from '@angular/core';
import {Client, Message} from 'paho-mqtt';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {MqttMessage} from "../model/mqtt-message";

@Injectable({
  providedIn: 'root'
})
export class MqttService {
  private client: Client | null = null;
  private readonly connectSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);

  private receivedMessages: MqttMessage[] = [];
  private publishedMessages: MqttMessage[] = [];
  private receivedMessagesChanged$: Subject<MqttMessage> = new Subject();
  private publishedMessagesChanged$: Subject<MqttMessage> = new Subject<MqttMessage>();
  private clientId: string = (Math.random()).toString(36).substring(2);
  private hosts: string[] = ['wss://test.mosquitto.org:8081/mqtt', 'wss://mqtt-dashboard.com:8884/mqtt'];
  private hostUrl: string = this.hosts[0];
  private hostsChanged$: Subject<string[]> = new Subject<string[]>();
  private subscribedTopics: string[] = [];
  private subscribedTopicsChanged$: Subject<string> = new Subject();


  constructor() {
  }

  getSubscribedTopicsObservable() : Observable<string>{
    return this.subscribedTopicsChanged$.asObservable();
  }
  public getReceivedMessages(): MqttMessage[] {
    return this.receivedMessages;
  }

  public getPublishedMessages(): MqttMessage[] {
    return this.publishedMessages;
  }

  public getSubscribedTopics(): string[] {
    return this.subscribedTopics;
  }

  public getPublishedMessagesChanged(): Observable<MqttMessage> {
    return this.publishedMessagesChanged$.asObservable();
  }

  public getClientId(): string {
    return this.clientId;
  }

  public addTestHost(newHost: string): void {
    this.hosts.push(newHost);
    this.hostsChanged$.next(this.hosts);
  }

  public removeTestHost(host: string): void {
    this.hosts = this.hosts.filter((h) => h !== host);
    this.hostsChanged$.next(this.hosts);
    this.hostUrl = this.hosts[0];
  }

  public getTestHostsChanged(): Observable<string[]> {
    return this.hostsChanged$.asObservable();
  }

  public getTestHosts(): string[] {
    return this.hosts;
  }

  onConnectionLost(responseObject: { errorCode: number; errorMessage: string; }) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost : " + responseObject.errorMessage);
      this.connectSubject.next(false);
    }

  }

  public isConnectedChanged(): Observable<boolean> {
    return this.connectSubject.asObservable();
  }

  public connect(): Observable<boolean> {
    console.log(this.connectSubject)
    console.log(this.client)
    this.client = new Client(this.hostUrl, 'clientId' + this.clientId);
    console.log(this.client)

    this.client.connect({
      onSuccess: this.onConnect.bind(this),
      onFailure: this.onConnectFailure.bind(this),
      reconnect: true,
      keepAliveInterval: 900,
      cleanSession: false
    });
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    return this.connectSubject.asObservable();
  }


  public subscribe(topic: string): void {
    console.log('tsub: ', topic)
    if (!this.subscribedTopics.includes(topic)) {
      this.subscribedTopics.push(topic);
      this.client?.subscribe(topic);
    }
  }

  private getSubscribedTopicsSubject(): Observable<string> {
    return this.subscribedTopicsChanged$.asObservable();
  }

  public unsubscribe(topic: string): void {
    const index = this.subscribedTopics.indexOf(topic);
    if (index !== -1) {
      this.subscribedTopics.splice(index, 1);
      this.client?.unsubscribe(topic);
    }
  }

  public disconnect(): void {
    this.connectSubject.next(false);
    this.client?.disconnect();
  }

  public setClientId(id: string): void {
    this.clientId = id;
  }

  public sendMessage(topic: string, payload: string): void {
    const mqttMessage = {topic: topic, client: this.clientId, payload: payload, timestamp : Date.now()} as MqttMessage;
    const message = new Message(JSON.stringify(mqttMessage));
    this.publishedMessages.push(mqttMessage);
    this.publishedMessagesChanged$.next(mqttMessage);
    message.destinationName = topic;
    this.client?.send(message);
  }

  public getHostUrl(): string {
    return this.hostUrl;
  }

  public setHostUrl(value: string): void {
    this.hostUrl = value;
  }

  private onConnect(): void {
    if (this.client?.isConnected()) {
      this.connectSubject.next(true);
    } else {
      this.connectSubject.next(false);
    }
  }

  private onConnectFailure(responseObject: object): void {
    console.log('Failed to connect', responseObject);
    this.connectSubject.next(false);
  }

  private onMessageArrived(message: Message): void {
    console.log('Message arrived: ', message);
    const mqttMessage: MqttMessage = JSON.parse(message.payloadString);
    this.receivedMessages.push(mqttMessage);
    this.receivedMessagesChanged$.next(mqttMessage);
  }

  public getReceivedMessageObservable(): Observable<MqttMessage> {
    return this.receivedMessagesChanged$.asObservable();
  }

  public getPublishedMessageObservable(): Observable<MqttMessage> {
    return this.publishedMessagesChanged$.asObservable();
  }

  generateNewClientId(): void {
    this.clientId = (Math.random()).toString(36).substring(2);
  }

}
