import {Component, Input, OnInit} from '@angular/core';
import {MqttMessage} from "../../model/mqtt-message";
import {MqttService} from "../../services/mqtt.service";

@Component({
  selector: 'app-message-history',
  templateUrl: './message-history.component.html',
  styleUrls: ['./message-history.component.scss']
})
export class MessageHistoryComponent {
  @Input() messages: MqttMessage[] = [];

  getTimestamp(timestamp: number) {
    const now = new Date(timestamp);
    const year = now.getFullYear().toString().padStart(4, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

}
