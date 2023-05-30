import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MqttMessage} from "../../model/mqtt-message";
import {MqttService} from "../../services/mqtt.service";

@Component({
  selector: 'app-message-history',
  templateUrl: './message-history.component.html',
  styleUrls: ['./message-history.component.scss']
})
export class MessageHistoryComponent {
  @Input() messages: MqttMessage[] = [];
  @Output() messagesChanged$: EventEmitter<MqttMessage[]> = new EventEmitter<MqttMessage[]>();
  selectedMessages: Set<number> = new Set<number>();

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

  toggleMessageSelection(timestamp: number): void {
    if (this.selectedMessages.has(timestamp)) {
      this.selectedMessages.delete(timestamp);
    } else {
      this.selectedMessages.add(timestamp);
    }
  }

  deleteSelectedMessages(): void {
    const messagesToDelete = this.messages.filter(message => this.selectedMessages.has(message.timestamp));
    this.messagesChanged$.emit(messagesToDelete);
    this.messages = this.messages.filter(message => !this.selectedMessages.has(message.timestamp));
    this.selectedMessages.clear();
  }

  selectAll(): void {
    this.selectedMessages = new Set<number>();

    const selectedMessageKeys = new Set<string>();

    for (const message of this.messages) {
      const messageKey = message.timestamp.toString() + '-' + message.topic;

      if (!selectedMessageKeys.has(messageKey)) {
        this.selectedMessages.add(message.timestamp);
        selectedMessageKeys.add(messageKey);
      }
    }
  }
}
