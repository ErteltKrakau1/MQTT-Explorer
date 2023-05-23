import { Injectable } from '@angular/core';
import { Client, Message } from 'paho-mqtt';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MqttService {
  private readonly client: Client;
  private readonly connectSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);
  private hostUrl: string = 'wss://test.mosquitto.org:8081/mqtt';
  private topics: string[] = [];
  private intervalId: any;

  constructor() {
    this.client = new Client(this.hostUrl, 'clientId' + Math.random());
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
  }

  connect(): Observable<boolean> {
    this.client.connect({
      onSuccess: this.onConnect.bind(this),
      onFailure: this.onConnectFailure.bind(this)
    });

    return this.connectSubject.asObservable();
  }

  subscribe(topic: string): void {
    this.client.subscribe(topic);
  }

  disconnect(): void {
    this.client.disconnect();
    this.stopInterval();
  }

  sendMessage(topic: string, payload: string): void {
    this.topics.push(topic);
    const message = new Message(payload);
    message.destinationName = topic;
    this.client.send(message);
  }

  getHostUrl(): string {
    return this.hostUrl;
  }

  setHostUrl(value: string): void {
    this.hostUrl = value;
  }

  private onConnect(): void {
    console.log('Connected: ', this.client);
    this.connectSubject.next(true);
    this.startInterval();
  }
  private onConnectFailure(responseObject: object): void {
    console.log('Failed to connect', responseObject);
    this.connectSubject.next(false);
    this.stopInterval();
  }

  private onMessageArrived(message: Message): void {
    console.log('Message arrived: ', message);
  }

  private startInterval(): void {
    if (!this.intervalId) {
      this.intervalId = setInterval(this.getConnectionStatus.bind(this), 1000);
    }
  }

  private stopInterval(): void {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private getConnectionStatus(): void {
    console.log('Connection status: ', this.client.isConnected());
  }
  getTopics(){
    return this.topics;
  }
}
