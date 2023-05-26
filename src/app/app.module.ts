import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrokerComponent } from './ui/broker/broker.component';
import { SubscribeComponent } from './ui/subscribe/subscribe.component';
import { PublishComponent } from './ui/publish/publish.component';

@NgModule({
  declarations: [
    AppComponent,
    BrokerComponent,
    SubscribeComponent,
    PublishComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
