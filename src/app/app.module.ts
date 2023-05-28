import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrokerComponent } from './ui/broker/broker.component';
import { SubscribeComponent } from './ui/subscribe/subscribe.component';
import { PublishComponent } from './ui/publish/publish.component';
import { TopicSearchComponent } from './ui/topic-search/topic-search.component';
import {FormsModule} from "@angular/forms";
import { MessageHistoryComponent } from './ui/message-history/message-history.component';

@NgModule({
  declarations: [
    AppComponent,
    BrokerComponent,
    SubscribeComponent,
    PublishComponent,
    TopicSearchComponent,
    MessageHistoryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
