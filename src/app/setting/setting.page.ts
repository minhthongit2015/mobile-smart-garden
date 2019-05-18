import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { ConnectionService } from '../services/connection.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  gardenList = [];
  curGarden;

  constructor(public navCtrl: NavController, private conn: ConnectionService,
    public alert: AlertController) {

  }

  onBackBtn() {
    this.navCtrl.goBack(true);
  }
  onHomeBtn() {
    this.navCtrl.navigateRoot('/home', true);
  }
  onLogoutBtn() {
    this.navCtrl.navigateRoot('/login', true);
  }

  ngOnInit() {
    let localData = localStorage["savedGardens"];
    try {
      localData = JSON.parse(localData);
    } catch (err) {
      localData = null;
    }

    this.gardenList = localData || [
      { name: "Garden 01", protected: 'Yes', localIP: '192.168.1.4', location: '34/7 Nguyen Van Bao, P4, Q. Go Vap', id: 'c242ce41-f200-11e8-bb18-b7e4d9c17abc' },
      { name: "Garden 02", protected: 'No', localIP: '192.168.10.9', location: '12 Le Loi, P4, Go Vap' },
      { name: "Garden 03", protected: 'Yes', localIP: '192.168.37.5', location: '584 Pham Van Dong' }
    ];
    this.curGarden = this.gardenList[this.focusGarden-1];
    this.activeTool = this.focusGarden != 0;
  }

  /** Sự kiện click vào xem thông tin vườn */
  activeTool: boolean = false;
  focusGarden: number = 1;
  onFocusGarden(gIndex) {
    this.focusGarden = gIndex==this.focusGarden ? 0 : gIndex;
    this.activeTool = this.focusGarden != 0;
    this.curGarden = this.gardenList[this.focusGarden-1];
  }

  /** Sự kiện kết nối với garden nào đó */
  async onConnectGarden() {
    if (!this.curGarden) return;
    if (!this.conn.wsConnected) {
      let alert1 = await this.alert.create({
        header: "Instruction 01",
        message: "No connection to Insys Cloud Server are available!<br><div align=left>- Opt 1: Check your internet and try again.<br>- Opt 2: Try to connect through your local network.</div>",
        buttons: [
          {
            text: 'Check Internet',
            role: 'cancel',
            cssClass: 'secondary',
          }, {
            text: 'Local Network',
            handler: () => {
              this.connectThroughLocalNetwork();
            }
          }
        ]
      });
      await alert1.present();
    } else {
      let alert1 = await this.alert.create({
        header: "Choose Connect Method",
        message: "You want to connect through Internet or your current Local Network?",
        buttons: [
          {
            text: 'Internet',
            handler: (blah) => {
              this.connectThroughInternet();
            }
          }, {
            text: 'Local Network',
            handler: () => {
              this.connectThroughLocalNetwork();
            }
          }
        ]
      });
      await alert1.present();
    }
  }

  async connectThroughInternet() {
    if (localStorage["ConnectedGarden"]) {
      this.conn.leaveRoom(localStorage["ConnectedGarden"]);
    }

    localStorage["ConnectedGarden"] = this.curGarden.id; // Lưu ID vườn để kết nối sau

    this.conn.wsSend("Conn2Garden", this.curGarden.id, async (rs) => {
      this.conn.leaveRoom(localStorage["ConnectedGarden"]); // Rời khỏi room ngay để tránh dữ liệu thừa

      let alert3 = await this.alert.create({
        header: rs ? "Succeed!" : "Garden Offline!",
        message: rs ? "Connection to your garden is established!" : "Connection to your garden is setting up. But your garden is not online yet.",
        buttons: ["OK"]
      });
      await alert3.present();
    });
  }

  async connectThroughLocalNetwork() {
    this.saveCurrentGarden();
    let socket = this.conn.setupConnectToLocalGarden(this.curGarden.localIP);
    socket.addEventListener("open", async (e) => {
      let alert3 = await this.alert.create({
        header: "Connected!",
        message: "The connection to the garden is established!",
        buttons: ["OK"]
      });
      await alert3.present();
    })
  }

  onLeaveGarden() {
    if (localStorage["ConnectedGarden"]) {
      this.conn.leaveRoom(localStorage["ConnectedGarden"]);
    }
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
            if (prop == "localIP") {
              this.conn.updateLocalIP(garden.localIP);
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
