import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './ui/header/header.component';
import { BrokerComponent } from './ui/broker/broker.component';
import { SubscribeComponent } from './ui/subscribe/subscribe.component';
import { PublishComponent } from './ui/publish/publish.component';
import { NavigationButtonComponent } from './ui/navigation-button/navigation-button.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    BrokerComponent,
    SubscribeComponent,
    PublishComponent,
    NavigationButtonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
