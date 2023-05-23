import {Component, Input, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterModule} from "@angular/router";
import {filter} from "rxjs";

@Component({
  selector: 'app-navigation-button',
  templateUrl: './navigation-button.component.html',
  styleUrls: ['./navigation-button.component.scss']
})
export class NavigationButtonComponent implements OnInit {
  @Input() buttonName : string = '';
  @Input() url: string = '';
  isActive : boolean = false;
  constructor(private router: Router) {
  }
  ngOnInit(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event) => {
      const navigationEndEvent = event as NavigationEnd;
      this.isActive = this.matchesUrl(this.url, navigationEndEvent.url);
    });
  }

  private matchesUrl(buttonUrl : string, routerUrl : string) : boolean {
    return buttonUrl === routerUrl;
  }
}
