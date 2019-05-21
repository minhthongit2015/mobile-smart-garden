import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { ConnectionService } from '../services/connection.service';
import { AuthService } from '../modules/auth/auth.service';
import { GardenInfoService } from '../modules/garden-info/garden-info.service';
import { WS_EVENTS } from '../constants';

@Component({
  selector: 'app-manage-gardens',
  templateUrl: './manage-gardens.page.html',
  styleUrls: ['./manage-gardens.page.scss'],
})
export class ManageGardensPage implements OnInit {
  gardenList = [];
  curGarden: any;

  constructor(public navCtrl: NavController,
    private conn: ConnectionService,
    public alert: AlertController,
    public loadingController: LoadingController,
    private authService: AuthService,
    private gardenInfoService: GardenInfoService
    ) {
  }

  ngOnInit() {
    let localData = localStorage["savedGardens"];
    try {
      localData = JSON.parse(localData);
    } catch (err) {
      localData = null;
    }

    this.gardenList = localData || [
      { name: "Garden 01", protected: 'Yes', local_ip: '192.168.1.4', location: '34/7 Nguyen Van Bao, P4, Q. Go Vap', id: 'c242ce41-f200-11e8-bb18-b7e4d9c17abc' },
      { name: "Garden 02", protected: 'No', local_ip: '192.168.10.9', location: '12 Le Loi, P4, Go Vap' },
      { name: "Garden 03", protected: 'Yes', local_ip: '192.168.37.5', location: '584 Pham Van Dong' }
    ];
    this.curGarden = this.gardenList[this.focusGarden-1];
    this.activeTool = this.focusGarden != 0;
  }

  ionViewDidEnter() {
    this.authService.isLoggedIn().subscribe(async (isLogged) => {
      if (!isLogged) {
        let alert3 = await this.alert.create({
          header: "You're In Demo Mode!",
          message: "This is the demo mode of the Smart Garden App. You will get the real data when you signed in.",
          buttons: [
            {
              text: "Go to Sign-in",
              cssClass: 'default-button',
              handler: () => {
                this.navCtrl.navigateForward('/login');
              }
            }, 
            {
              text: "OK, Good! Let me try first!"
            }
          ]
        });
        await alert3.present();
      } else {
        const gardensObservable = await this.gardenInfoService.getAllGardens();
        gardensObservable.subscribe((gardens) => {
          this.gardenList = gardens;
          this.saveGardenList();
        });
      }
    }).unsubscribe();

    // if (!this.conn.wsConnected) {
    //   let alert1 = await this.alert.create({
    //     header: "Instruction 01",
    //     message: "No connection to Insys Cloud Server are available!<br><div align=left>- Opt 1: Check your internet and try again.<br>- Opt 2: Try to connect through your local network.</div>",
    //     buttons: [
    //       {
    //         text: 'Check Internet',
    //         role: 'cancel',
    //         cssClass: 'secondary',
    //       }, {
    //         text: 'Local Network',
    //         handler: () => {
    //           this.connectThroughLocalNetwork();
    //         }
    //       }
    //     ]
    //   });
    //   await alert1.present();
    // }
  }

  onBackBtn() {
    this.navCtrl.goBack(true);
  }
  onHomeBtn() {
    this.navCtrl.navigateRoot('/home', true);
  }
  async onLogoutBtn() {
    await this.authService.logout();
    let alert1 = await this.alert.create({
      header: "Logged out",
      message: "You have successfully logged out!",
      buttons: ["OK"]
    });
    await alert1.present();
  }

  /** Sự kiện click vào xem thông tin vườn */
  activeTool: boolean = false;
  focusGarden: number = 1;
  onFocusGarden(gIndex) {
    this.focusGarden = gIndex == this.focusGarden ? 0 : gIndex;
    this.activeTool = this.focusGarden != 0;
    this.curGarden = this.gardenList[this.focusGarden-1];
  }

  /** Sự kiện click kết nối với garden nào đó */
  async onConnectGarden() {
    if (!this.curGarden) return;

    let alert1 = await this.alert.create({
      header: "Choose Connect Method",
      message: "You want to connect <b>Through Internet</b> or <b>Through your Local Network</b>?",
      buttons: [
        {
          text: 'Through Internet',
          cssClass: 'default-button',
          handler: (blah) => {
            this.connectThroughInternet();
          }
        }, {
          text: 'Through Local Network',
          handler: () => {
            this.connectThroughLocalNetwork();
          }
        }
      ]
    });
    await alert1.present();
  }

  async connectThroughInternet() {
    const loading = await this.loadingController.create({
      message: 'Connecting to Garden through cloud server...'
    });
    await loading.present();

    localStorage["ConnectedGarden"] = this.curGarden.id; // Lưu ID vườn để kết nối sau

    this.gardenInfoService.requestAccess(this.curGarden.id).subscribe(async (rs) => {
      loading.dismiss();
      const { isAccessible, isOnline } = rs;
      if (isAccessible) {
        let alert3 = await this.alert.create({
          header: isOnline ? "Garden Online!" : "Garden Offline!",
          message: isOnline ? "Connection to your garden is established! Your garden is online now." : "Connection to your garden is setting up. But your garden is not online now.",
          buttons: [
            {
              text: "OK, Go to My Garden >",
              handler: () => {
                if (rs) {
                  this.navCtrl.navigateForward('/garden');
                }
              }
            }
          ]
        });
        await alert3.present();
      } else {
        let alert3 = await this.alert.create({
          header: "Access Denied!",
          message: "You are not allow to access to this garden!",
          buttons: [
            {
              text: "OK",
              handler: () => {
                if (rs) {
                  this.navCtrl.navigateForward('/garden');
                }
              }
            }
          ]
        });
        await alert3.present();
      }
    }, async (error) => {
      loading.dismiss();
      let alert3 = await this.alert.create({
        header: "Connect Failed!",
        message: `Cannot connect to garden <b>${this.curGarden.name}</b> through Cloud Server!<br><i>${error.message}</i>`,
        buttons: [
          {
            text: "OK"
          }
        ]
      });
      await alert3.present();
    });
  }

  async connectThroughLocalNetwork() {
    const loading = await this.loadingController.create({
      message: `Connecting to Garden at address ${this.curGarden.local_ip}...`
    });
    await loading.present();
    
    let socket = this.conn.setupConnectToLocalGarden(this.curGarden.local_ip);
    socket.addEventListener("open", async (e) => {
      let alert3 = await this.alert.create({
        header: "Connected!",
        message: "The connection to the garden is established!",
        buttons: [
          {
            text: "OK",
            handler: () => {
              this.navCtrl.navigateForward('/garden');
            }
          }
        ]
      });
      await alert3.present();
    });
    socket.addEventListener("error", async (e) => {
      let alert3 = await this.alert.create({
        header: "Connect Failed!",
        message: `Cannot connect to garden at IP ${this.curGarden.local_ip}!`,
        buttons: [
          {
            text: "OK",
            handler: () => {
              this.navCtrl.navigateForward('/garden');
            }
          }
        ]
      });
      await alert3.present();
    });
  }

  async onEditGardenInfo(garden, prop) {
    if (!prop) return;

    let alert3 = await this.alert.create({
      header: "Garden Local IP",
      message: "Input Garden Local IP!",
      buttons: [
        { text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }, { text: 'OK',
          handler: (inputs) => {
            garden[prop] = inputs[prop];
            this.curGarden = this.curGarden;
            if (prop == "local_ip") {
              this.conn.updateLocalIP(garden.local_ip);
            }
            this.saveGardenList();
          }
        }
      ],
      inputs: [
        { type: "text",
          name: prop,
          placeholder: "IP like 192.168.1.44",
          value: garden[prop]
        }
      ]
    });
    await alert3.present();
  }

  saveGardenList() {
    try {
      localStorage["savedGardens"] = JSON.stringify(this.gardenList);
    } catch (err) {
      console.log(err);
    }
    this.saveCurrentGarden();
  }
  saveCurrentGarden() {
    try {
      localStorage["currentGarden"] = JSON.stringify(this.curGarden);
    } catch (err) {
      console.log(err);
    }
  }

}
