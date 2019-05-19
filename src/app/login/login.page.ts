import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '../services/connection.service';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
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

  constructor(public navCtrl: NavController,
    private conn: ConnectionService,
    public alert: AlertController,
    public loadingController: LoadingController,
    private authService:  AuthService) {
  }

  onBack() {
    this.navCtrl.goBack(true);
  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.authService.isLoggedIn().subscribe(async (isLogged) => {
      if (isLogged) {
        let alert3 = await this.alert.create({
          header: "You are Already Signed in!",
          message: "You could go back or continue to sign in with another account.",
          buttons: [
            { text: "Sign in to Another Account" },
            {
              text: "OK, Get me back",
              cssClass: 'default-button',
              handler: () => {
                this.navCtrl.goBack();
              }
            }]
        });
        await alert3.present();
      }
    }).unsubscribe();
  }
  
  async login() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.authService.login({ username: this.username, password: this.password }).subscribe(async (res) => {
      loading.dismiss();
      if (!res || !res.user) {
        let alert3 = await this.alert.create({
          header: "Login Failed!",
          message: "Wrong username or password. Please try again.",
          buttons: ["OK"]
        });
        await alert3.present();
      } else {
        let alert3 = await this.alert.create({
          header: "Welcome To Your Smart Garden!",
          message: `Hello ${res.user.name}. Welcome back ٩(^-^)۶`,
          buttons: [
            {
              text: "OK, Get me back",
              handler: () => {
                this.navCtrl.goBack();
              }
            }
          ]
        });
        await alert3.present();
      }
    }, async (error) => {
      loading.dismiss();
      let alert3 = await this.alert.create({
        header: "Login Error!",
        message: `Something went wrong!<br>"${error.message}"`,
        buttons: ["OK"]
      });
      await alert3.present();
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
