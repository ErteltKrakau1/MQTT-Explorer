import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {BrokerComponent} from "./ui/broker/broker.component";
import {SubscribeComponent} from "./ui/subscribe/subscribe.component";
import {PublishComponent} from "./ui/publish/publish.component";

const routes: Routes = [
  { path: '', redirectTo: '/broker', pathMatch: 'full' },
  { path: 'broker', component: BrokerComponent },
  { path: 'subscribe', component: SubscribeComponent },
  { path: 'publish', component: PublishComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
