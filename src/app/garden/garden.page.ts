import { Component, OnInit } from '@angular/core';

import { NavController } from '@ionic/angular';
import { ConnectionService } from '../services/connection.service';
import { SmartGarden, Station, UserPlant } from '../+shared/model/garden';
import { SGNotification } from '../+shared/model/notification';
import { Router } from '@angular/router';
import { ConnectionManager } from '../+shared/smart-garden-connection';
import { WS_EVENTS } from '../constants';

@Component({
  selector: 'app-garden',
  templateUrl: './garden.page.html',
  styleUrls: ['./garden.page.scss'],
})
export class GardenPage implements OnInit {
  myGarden: SmartGarden;
  notifications: SGNotification[] = [];
  gardenProto: ConnectionManager;

  constructor(private router: Router, private conn: ConnectionService, private navCtrl: NavController) {
    this.gardenProto = new ConnectionManager();
    this.conn.wsOn("connect", () => {
      this.setupDataChannel(1);
    });
  }
  onBackBtn() { this.navCtrl.goBack(true); }
  onHomeBtn() { this.navCtrl.navigateRoot('/home', true); }
  onLogoutBtn() { this.navCtrl.navigateRoot('/login', true); }

  ngOnInit() {
    this.notifications = [
      new SGNotification('Thu hoạch dâu tây sau 1 ngày nữa', 'inform'),
      new SGNotification('Sự kiện ẩm thực! Bạn muốn tham gia?', 'inform'),
      new SGNotification('Thời tiết đẹp, khí trời mát mẻ!', 'inform')
    ];
    this.notifications.reverse();
    this.hasNoti = true;

    this.initGardenState();
  }

  initGardenState() {
    // Nạp dữ liệu cục bộ từ localStorage lên
    let localGarden = localStorage["currentGarden"];
    try { localGarden = JSON.parse(localGarden);
    } catch (err) { localGarden = null; }

    let curGarden = localGarden || { name: "Heaven Garden!" };

    // Chuẩn hóa dữ liệu thành đối tượng SmartGarden + Nạp dữ liệu mẫu
    this.myGarden = new SmartGarden(curGarden, [
      new Station({ name: "Giàn sân thượng 01", id: "A1", plants: [
        new UserPlant("tomato")
      ], equipments: [], automation_mode: true, state: {}, evaluations: {}, style: 'b1', position: [0,0] }),
      new Station({ name: "Giàn sân thượng 02", id: "A2", plants: [
        new UserPlant("carrot")
      ], equipments: [], automation_mode: true, state: {}, evaluations: {}, style: 'b1', position: [0,1] }),
      new Station({ name: "Giàn sân thượng 03", id: "A3", plants: [
        new UserPlant("carrot"),
        new UserPlant("carrot"),
        new UserPlant("carrot")
      ], equipments: [], automation_mode: true, state: {}, evaluations: {}, style: 'v3', position: [0,2] }),
      new Station({ name: "Giàn ban công 01", id: "A4", plants: [
        new UserPlant("strawberry"),
        new UserPlant("strawberry"),
        new UserPlant("strawberry")
      ], equipments: [], automation_mode: true, state: {}, evaluations: {}, style: 'h3', position: [1,0] })
    ]);
  }

  ionViewDidEnter() {
    if (this.conn.wsConnected) {
      this.setupDataChannel(1);
    }

    this.conn.setupConnectToLocalGarden(this.myGarden.localIP);
    this.conn.localSocket.attachEventListeners({
      message: (e) => this.onLocalGardenEvent(e),
      open: (e) => this.setupDataChannel(2)
    });
  }

  startAnimation: boolean = false;
  ngAfterViewInit() {
    /**
     * [Kịch bản]: Future Tech Animate
     * 0.5s  : Bắt đầu vẽ line tới chỉ số (2s) - css
     * .75s  : Bắt đầu đẩy nút lên (3s) - css
     *         Bắt đầu tạo bóng đổ (3s) - js
     * 3.75s : Bắt đầu vẽ Auto (3s) - js
     * 6s    : Bắt đầu vẽ Mode (3s) - js
     */

    let sound = (<any>document.getElementById('startup-sound'));
    sound.play();
    sound.onplay = () => {
      this.startAnimation = true;
      setTimeout(() => {(<any>document.getElementById("shadow-animate")).beginElement()}, 750);
  
      setTimeout(() => {(<any>document.getElementById("auto-path-animate")).beginElement()}, 3000);
      setTimeout(() => {(<any>document.getElementById("mode-path-animate")).beginElement()}, 4400);
    }
  }

  ionViewWillLeave() {
    // this.conn.socket.removeListener("GardenEvent", this.onGardenEvent);
    this.conn.socket.removeAllListeners("GardenEvent");
    this.attachGardenEvent = false;
    this.conn.wsSend(WS_EVENTS.mobile2Cloud, "leave", {
      gardens: []
    }, (rs) => {
      console.log(rs);
    });
    for (let i=0; i<2000; i++) clearTimeout(i);

    this.conn.localSocket.clearListener("message");
    this.conn.localSocket.clearListener("open");
    this.conn.localSocket.close();
  }



  /************************************************************************
   *                       Setup Data Channel Area                        *
   ************************************************************************/

  attachGardenEvent: boolean = false;
  setupDataChannel(type) {
    if (type==1 || type==3) {
      this.conn.wsSend(WS_EVENTS.mobile2Cloud, "watch", {
        gardens: [+localStorage['ConnectedGarden']]
      }, (rs) => {
        // [Sự kiện]: Dữ liệu từ vườn gửi đến các app đang kết nối
        if (!this.attachGardenEvent) {
          this.attachGardenEvent = true;
          this.conn.wsOn(WS_EVENTS.garden2Mobile, (data) => this.onGardenEvent(data));
        }
      });
    }
    if (type==2 || type==3) {
      this.conn.localSocket.send(this.gardenProto.buildPackage([2,1], ''));
    }
  }

  onGardenEvent(data) {
    this;
    console.log(data);
  }



  /************************************************************************
   *                      Local Garden Handle Area                        *
   ************************************************************************/

  onLocalGardenEvent(e) {
    let packages = [];
    try {
      packages = this.gardenProto.packagesResolve(e.data);
    } catch (err) {
      console.log(err);
    }
    for (let pkg of packages)
      this.gardenPackageHandle(pkg);
  }

  gardenPackageHandle(pkg) {
    switch (pkg.cmd) {
      case 2:
        if (pkg.sub1 == 1) this.loadGardenState(pkg.msg);
        break;
    
      default:
        break;
    }
  }

  loadGardenState(jsonStr) {
    if (!this.myGarden) this.myGarden = new SmartGarden();
    this.myGarden.loadByJson(jsonStr);
    
    if (this.activeStation) {
      let curId = this.activeStation.id || "";
      this.activeStation = this.myGarden.stations.find(sta => sta.id == curId);
      this.activeStation.focus = true;
    }
  }


  /************************************************************************
   *                             Overview Area                            *
   ************************************************************************/

  automode = true;
  onToggleAutoMode(e) {
    this.automode = !this.automode;
  }



  /************************************************************************
   *                          Notifications Area                          *
   ************************************************************************/

  hasNoti: boolean = false;
  onConfirmNoti(noti) {
    noti.viewed = true;
    this.hasNoti = this.notifications[0] != noti;
  }



  /************************************************************************
   *                            Stations Area                             *
   ************************************************************************/

  activeTool: boolean = false;
  activeStation: Station;
  onFocusStation(station, stations) {
    let focus = !station.focus;
    for (let sta of stations) sta.focus = false;
    station.focus = focus;
    this.activeTool = focus;
    this.activeStation = focus ? station : null;
  }

  /** Sự kiện người dùng click vào nút xem chi tiết */
  onSeeMore() {
    // this.router.navigateByUrl('/garden-detail/'+this.activeStation.name);
    localStorage["currentStation"] = JSON.stringify(this.activeStation);
    this.navCtrl.navigateForward('/garden-detail/'+this.activeStation.id, true, );
  }
}
