import {Component} from '@angular/core';
import {MqttService} from 'src/app/services/mqtt.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-broker',
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.scss']
})
export class BrokerComponent {
  public hostUrl: string = '';
  public isConnected: boolean = false;
  private isConnectedChanged$: Subscription;
  testHostsChanged$: Subscription;
  private newHost: string = '';
  public selectedHost: string = '';
  public showAddHostPopup: boolean = false;
  public activeButton: string | null = null;
  testHosts: string[] = [];

  constructor(public mqttService: MqttService) {
    this.isConnectedChanged$ = this.mqttService.isConnectedChanged().subscribe(newValue => this.isConnectedChanged(newValue));
    this.testHostsChanged$ = this.mqttService.getTestHostsChanged().subscribe((hosts: string[]) => this.onTestHostsChanged(hosts));
    this.testHosts = this.mqttService.getTestHosts();
    this.hostUrl = mqttService.getHostUrl();
    this.activeButton = this.testHosts[0];
    this.selectedHost = this.testHosts[0];
  }

  private onTestHostsChanged(hosts: string[]): void {
    this.testHosts = hosts;
    this.activeButton = this.testHosts[0];
    this.selectedHost = this.testHosts[0];
  }

  private isConnectedChanged(newValue: boolean): void {
    this.isConnected = newValue;
  }


  public connect(): void {
    this.mqttService.connect();
  }

  public onHostUrlChanged($event: Event): void {
    const newValue = ($event.target as HTMLInputElement).value;
    this.hostUrl = newValue;
    this.mqttService.setHostUrl(newValue)
  }

  public disconnect(): void {
    this.mqttService.disconnect();
  }

  public onClientIdChanged($event: Event): void {
    this.mqttService.setClientId(($event.target as HTMLInputElement).value);
  }

  public addNewHost() {
    this.showAddHostPopup = true;
  }

  public updateNewHost($event: Event) {
    this.newHost = ($event.target as HTMLInputElement).value;
  }

  public closeAddHostPopup(): void {
    this.showAddHostPopup = false;
  }

  public confirmAddHost(): void {
    if (this.newHost !== '') {
      this.mqttService.addTestHost(this.newHost);
      this.selectedHost = this.newHost;
      this.activeButton = this.newHost;
      this.mqttService.setHostUrl(this.newHost);
      this.showAddHostPopup = false;
    }
  }

  public isActiveButton(host: string): boolean {
    return this.activeButton === host;
  }

  public onHostChosen($event: Event): void {
    this.selectedHost = ($event.target as HTMLElement).innerText;
    this.activeButton = this.selectedHost;
    this.mqttService.setHostUrl(this.selectedHost);
  }


  onHostToDeleteChosen(): void {
    if (this.selectedHost !== '') {
      const index = this.testHosts.indexOf(this.selectedHost);
      if (index !== -1) {
        this.mqttService.removeTestHost(this.selectedHost);
        this.testHosts.splice(index, 1);
        this.selectedHost = this.testHosts[0];
        this.activeButton = this.selectedHost;
        this.mqttService.setHostUrl(this.selectedHost);
      }
    }
  }

  generateNewClientId() {
    this.mqttService.generateNewClientId();
  }
}
