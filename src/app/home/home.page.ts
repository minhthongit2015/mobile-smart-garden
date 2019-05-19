import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ConnectionService } from '../services/connection.service';
import { AuthService } from '../modules/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public navCtrl: NavController, private conn: ConnectionService, private authService:  AuthService) {
  }

  ngOnInit() {
    this.conn.wsSend("chat message", "I'm KID");
  }

}
