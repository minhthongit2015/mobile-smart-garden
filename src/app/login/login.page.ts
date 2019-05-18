import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '../services/connection.service';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username: string = "lucy1412";
  password: string = "LuckyDayzzz";
  ssid: string;

  constructor(public navCtrl: NavController, private conn: ConnectionService,
    public alert: AlertController) {
  }

  onBack() {
    this.navCtrl.goBack(true);
  }

  ngOnInit() {
    console.log("Login construct");
    this.ssid = localStorage["ssid"];
    // if (this.ssid) {
    //   this.navCtl.navigateForward('/home');
    // }
    // else {
    //   this.conn.wsSend('UserAppConnect', { uname: this.username, pwd: this.password, ssid: this.ssid }, (rs) => {
    //     this.ssid = rs;
    //     if (rs) {
    //       this.navCtl.navigateForward('/home');
    //       localStorage["ssid"] = this.ssid;
    //     }
    //   });
    // }
  }

  onLogin() {
    this.conn.wsSend('UserAppConnect', { uname: this.username, pwd: this.password }, async (rs) => {
      if (rs) {
        this.navCtrl.navigateForward('/home');
        localStorage["ssid"] = rs;
      } else {
        let alert3 = await this.alert.create({
          header: "Login Failed!",
          message: "Wrong username or password. Please try again.",
          buttons: ["OK"]
        });
        await alert3.present();
      }
    });
  }

  onRegister() {
    this.conn.wsSend('UserRegister', { uname: this.username, pwd: this.password, ssid: this.ssid }, (rs) => {
      if (rs) {
        if (rs.result) {
          this.ssid = rs;
          this.navCtrl.navigateForward('/home');
          localStorage["ssid"] = this.ssid;
        } else {
          console.log(rs);
        }
      }
    });
  }
}
