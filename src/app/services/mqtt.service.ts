import {Injectable} from '@angular/core';
import {Client, Message} from 'paho-mqtt';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MqttService {
  private client: Client | null = null;
  private readonly connectSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);
  private receivedMessages: Message[] = [];
  private receivedMessagesChanged$: Subject<Message> = new Subject();
  private clientId: string = (Math.random()).toString(36).substring(2);
  private publishedMessages: Message[] = [];
  private publishedMessagesChanged: Subject<Message> = new Subject<Message>();
  private hosts: string[] = ['wss://test.mosquitto.org:8081/mqtt', 'wss://mqtt-dashboard.com:8884/mqtt'];
  private hostUrl: string = this.hosts[0];
  private subscribedTopics: string[] = [];
  private testHostsChanged$: Subject<string[]> = new Subject<string[]>();


  constructor() {
  }

  public getTopics(): string[] {
    return this.subscribedTopics;
  }
  public getPublishedMessagesChanged(): Observable<Message> {
    return this.publishedMessagesChanged.asObservable();
  }

  public getClientId(): string {
    return this.clientId;
  }

  public addTestHost(newHost: string): void {
    this.hosts.push(newHost);
    this.testHostsChanged$.next(this.hosts);
  }

  public removeTestHost(host: string): void {
    this.hosts = this.hosts.filter((h) => h !== host);
    this.testHostsChanged$.next(this.hosts);
    this.hostUrl = this.hosts[0];
  }
  public getTestHostsChanged(): Observable<string[]> {
    return this.testHostsChanged$.asObservable();
  }

  public getTestHosts(): string[] {
    return this.hosts;
  }

  private onConnectionLost(): void {
    this.connectSubject.next(false);
  }

  public isConnectedChanged(): Observable<boolean> {
    return this.connectSubject.asObservable();
  }

  public connect(): Observable<boolean> {
    this.client = new Client(this.hostUrl, 'clientId' + Math.random());


    this.client.connect({
      onSuccess: this.onConnect.bind(this),
      onFailure: this.onConnectFailure.bind(this)
    });
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    console.log('connect; ', this.client.isConnected())
    return this.connectSubject.asObservable();
  }


  public subscribe(topic: string): void {
    if (!this.subscribedTopics.includes(topic)) {
      this.subscribedTopics.push(topic);
      this.client?.subscribe(topic);
    }
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
    const message = new Message(payload);
  this.publishedMessagesChanged.next(message);
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
    this.receivedMessagesChanged$.next(message);
  }

  public getReceivedMessageObservable(): Observable<Message> {
    return this.receivedMessagesChanged$.asObservable();
  }

  public getPublishedMessageObservable(): Observable<Message> {
    return this.receivedMessagesChanged$.asObservable();
  }

  getReceivedTopics() {
    return this.receivedMessages;
  }

  generateNewClientId() : void {
    this.clientId = (Math.random()).toString(36).substring(2);
  }

}
