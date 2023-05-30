import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {MqttService} from "../../services/mqtt.service";

@Component({
  selector: 'app-topic-search',
  templateUrl: './topic-search.component.html',
  styleUrls: ['./topic-search.component.scss']
})
export class TopicSearchComponent implements OnInit{
  public searchTerm: string = '';
  @Input() filteredTopics: string[] = [];
  public showDropdown: boolean = false;
  @Output() topicChanged$: EventEmitter<string> = new EventEmitter<string>();
  @HostListener('document:click', ['$event'])
  public onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }


  constructor(private mqttService: MqttService, private elementRef: ElementRef) {}

  public ngOnInit(): void {
  }

  public showTopics(): void {
    this.showDropdown = true;
  }

  public filterTopics(): void {
    this.filteredTopics = this.mqttService.getSubscribedTopics().filter((topic) =>
      topic.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.topicChanged$.emit(this.searchTerm);
  }

  public selectTopic(topic: string): void {
    this.searchTerm = topic;
    this.topicChanged$.emit(topic);
    this.showDropdown = false;
  }
}
