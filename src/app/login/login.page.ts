import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '../services/connection.service';
import { NavController, AlertController } from '@ionic/angular';
import { AuthService } from '../modules/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username: string = "thongnmtran";
  password: string = "sunday123";
  ssid: string;

  constructor(public navCtrl: NavController, private conn: ConnectionService,
    public alert: AlertController, private  authService:  AuthService) {
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
  
  login(form) {
    this.authService.login({ username: this.username, password: this.password }).subscribe(async (res) => {
      if (!res) {
        let alert3 = await this.alert.create({
          header: "Login Failed!",
          message: "Wrong username or password. Please try again.",
          buttons: ["OK"]
        });
        await alert3.present();
      } else {
        this.navCtrl.navigateForward('/home');
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
