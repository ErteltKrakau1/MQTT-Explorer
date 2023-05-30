import {Injectable} from '@angular/core';
import {Client, Message} from 'paho-mqtt';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {MqttMessage} from "../model/mqtt-message";
import {DatePipe} from "@angular/common";
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

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
  private clientIdChanged$ : Subject<string> = new BehaviorSubject(this.clientId);
  private hosts: string[] = ['wss://test.mosquitto.org:8081/mqtt', 'wss://mqtt-dashboard.com:8884/mqtt'];
  private hostUrl: string = this.hosts[0];
  private hostUrlChanged$: Subject<string> = new Subject<string>();
  private hostsChanged$: Subject<string[]> = new Subject<string[]>();
  private readonly subscribedTopics: string[] = [];
  private subscribedTopicsChanged$: Subject<string> = new Subject();
  private localStorageKey = 'mqttData';
  private statusMessages: string[] = [];
  private datePipe: DatePipe = new DatePipe('de-DE');


  constructor() {
    registerLocaleData(localeDe);
    const storedData = localStorage.getItem(this.localStorageKey);
    if (storedData) {
      const data = JSON.parse(storedData);
      this.receivedMessages = data.receivedMessages || [];
      this.publishedMessages = data.publishedMessages || [];
      this.subscribedTopics = data.subscribedTopics || [];
      this.clientId = data.clientId || '';
      this.hosts = data.hosts || ['wss://test.mosquitto.org:8081/mqtt', 'wss://mqtt-dashboard.com:8884/mqtt'];
      this.hostUrl = data.hostUrl || this.hosts[0];
    } else {
      this.receivedMessages = [];
      this.publishedMessages = [];
      this.subscribedTopics = [];
      this.clientId = '';
      this.hosts = ['wss://test.mosquitto.org:8081/mqtt', 'wss://mqtt-dashboard.com:8884/mqtt'];
      this.hostUrl = this.hosts[0];
    }
  }

  public getStatusMessages(): string[] {
    return this.statusMessages;
  }
  public getClientIdChangedObservable() : Observable<string>{
    return this.clientIdChanged$.asObservable();
  }

  private addStatusMessage(m: string): void {
    const timestamp = this.datePipe.transform(new Date(), 'dd.MM.yyyy HH:mm:ss');
    const statusMessage = timestamp + ': ' + m;
    this.statusMessages.push(statusMessage);
  }

  public getHostUrlChangedObservable(): Observable<string> {
    return this.hostUrlChanged$.asObservable();
  }

  public getSubscribedTopicsObservable(): Observable<string> {
    return this.subscribedTopicsChanged$.asObservable();
  }

  public getReceivedMessages(): MqttMessage[] {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data).receivedMessages : [];
  }

  public getPublishedMessages(): MqttMessage[] {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data).publishedMessages : [];
  }

  public getSubscribedTopics(): string[] {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data).subscribedTopics : [];
  }

  public getPublishedMessagesChanged(): Observable<MqttMessage> {
    return this.publishedMessagesChanged$.asObservable();
  }

  public getClientId(): string {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data).clientId : '';
  }

  public addTestHost(newHost: string): void {
    this.hosts.push(newHost);
    this.hostsChanged$.next(this.hosts);
    this.saveData();
  }

  public removeTestHost(host: string): void {
    this.hosts = this.hosts.filter((h) => h !== host);
    this.hostsChanged$.next(this.hosts);
    this.hostUrl = this.hosts[0];
    this.saveData();
  }

  public getTestHostsChangedObservable(): Observable<string[]> {
    return this.hostsChanged$.asObservable();
  }

  public getHosts(): string[] {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data).hosts : '';
  }

  onConnectionLost(responseObject: { errorCode: number; errorMessage: string; }) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost : " + responseObject.errorMessage);
      this.addStatusMessage(responseObject.errorMessage);
      this.connectSubject.next(false);
    }

  }

  public isConnectedChangedObservable(): Observable<boolean> {
    return this.connectSubject.asObservable();
  }

  public connect(): Observable<boolean> {
    try{
    this.client = new Client(this.hostUrl, 'clientId' + this.clientId);
   this.client.connect({
      onSuccess: this.onConnect.bind(this),
      onFailure: this.onConnectFailure.bind(this),
      reconnect: true,
      keepAliveInterval: 900,
      cleanSession: false
    });
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this); }
    catch (e) {
      // @ts-ignore
      this.addStatusMessage(e.toString());
    }
    return this.connectSubject.asObservable();
  }


  public subscribe(topic: string): void {
    if (!this.subscribedTopics.includes(topic)) {
      this.subscribedTopics.push(topic);
      this.client?.subscribe(topic);
      this.subscribedTopicsChanged$.next(topic);
      this.saveData();
    }
  }

  public unsubscribe(topic: string): void {
    const index = this.subscribedTopics.indexOf(topic);
    if (index !== -1) {
      this.subscribedTopics.splice(index, 1);
      this.client?.unsubscribe(topic);
      this.saveData();
    }
  }

  public disconnect(): void {
    this.addStatusMessage('disconnected');
    this.connectSubject.next(false);
    this.client?.disconnect();
  }

  public setClientId(id: string): void {
    this.clientId = id;
  }

  public sendMessage(topic: string, payload: string): void {
    const mqttMessage = {topic: topic, client: this.clientId, payload: payload, timestamp: Date.now()} as MqttMessage;
    const message = new Message(JSON.stringify(mqttMessage));
    this.publishedMessages.push(mqttMessage);
    this.publishedMessagesChanged$.next(mqttMessage);
    message.destinationName = topic;
    this.client?.send(message);
    this.saveData();
  }

  private saveData(): void {
    const data = {
      receivedMessages: this.receivedMessages,
      publishedMessages: this.publishedMessages,
      subscribedTopics: this.subscribedTopics,
      clientId: this.clientId,
      hosts: this.hosts
    };
    localStorage.setItem(this.localStorageKey, JSON.stringify(data));
  }

  public getHostUrl(): string {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data).hostUrl : this.hosts[0];
  }

  public setHostUrl(value: string): void {
    this.hostUrl = value;
    this.hostUrlChanged$.next(value);
    this.saveData();
  }

  private onConnect(): void {
    if (this.client?.isConnected()) {
      this.addStatusMessage('successfully connected');
      console.log(this.client)
      this.connectSubject.next(true);
    } else {
      this.connectSubject.next(false);
    }
  }

  private onConnectFailure(responseObject: object): void {
    console.log('Failed to connect', responseObject);
    this.addStatusMessage(responseObject.toString());
    this.connectSubject.next(false);
  }

  private onMessageArrived(message: Message): void {
    console.log('Message arrived: ', message);
    const mqttMessage: MqttMessage = JSON.parse(message.payloadString);
    this.receivedMessages.push(mqttMessage);
    this.receivedMessagesChanged$.next(mqttMessage);
    this.saveData();
  }

  public getReceivedMessageObservable(): Observable<MqttMessage> {
    return this.receivedMessagesChanged$.asObservable();
  }

  public getPublishedMessageObservable(): Observable<MqttMessage> {
    return this.publishedMessagesChanged$.asObservable();
  }

  public generateNewClientId(): void {
    this.clientId = (Math.random()).toString(36).substring(2);
    this.clientIdChanged$.next(this.clientId);
  }
  public updateReceivedMessages(messages : MqttMessage[]){
    this.receivedMessages = messages;
    this.saveData();
  }
  public updatePublishedMessages(messages : MqttMessage[]){
    this.publishedMessages = messages;
    this.saveData();
  }
}
