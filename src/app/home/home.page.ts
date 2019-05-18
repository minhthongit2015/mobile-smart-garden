import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ConnectionService } from '../services/connection.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public navCtrl: NavController, private conn: ConnectionService) {
  }

  ngOnInit() {
    this.conn.wsSend("chat message", "I'm KID");
  }

}
