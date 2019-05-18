import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { StationDetail, Station, SmartGarden } from '../+shared/model/garden';
import { ConnectionService } from '../services/connection.service';
import { ConnectionManager } from '../+shared/smart-garden-connection';

@Component({
  selector: 'app-garden-detail',
  templateUrl: './garden-detail.page.html',
  styleUrls: ['./garden-detail.page.scss'],
})
export class GardenDetailPage implements OnInit {
  id: string = "";
  station: Station;
  staInfo: StationDetail;
  gardenProto: ConnectionManager;
  curGarden: SmartGarden;

  constructor(private route: ActivatedRoute, private router: Router, private navCtrl: NavController,
    private conn: ConnectionService) {
    this.gardenProto = new ConnectionManager();
    this.conn.wsOn("connect", () => {
      this.setupDataChannel(1);
    });

    this.loadCurrentGarden();
    
    this.station = new Station(JSON.parse(localStorage["currentStation"]));
  }
  onBackBtn() { this.navCtrl.goBack(true); }
  onHomeBtn() { this.navCtrl.navigateRoot('/home', true); }
  onLogoutBtn() { this.navCtrl.navigateRoot('/login', true); }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  loadCurrentGarden() {
    let localGarden = localStorage["currentGarden"];
    try { localGarden = JSON.parse(localGarden);
    } catch (err) { localGarden = null; }

    this.curGarden = new SmartGarden(localGarden || { name: "Heaven Garden!" });
  }

  ionViewDidEnter() {
    if (this.conn.wsConnected) {
      this.setupDataChannel(1);
    }
    
    this.conn.setupConnectToLocalGarden(this.curGarden.localIP);
    this.conn.localSocket.attachEventListeners({
      message: (e) => this.onLocalGardenEvent(e),
      open: (e) => this.setupDataChannel(2)
    });
  }

  ionViewWillLeave() {
    // this.conn.socket.removeListener("GardenEvent", this.onGardenEvent);
    this.conn.socket.removeAllListeners("GardenEvent");
    this.attachGardenEvent = false;
    this.conn.leaveRoom(localStorage['ConnectedGarden'], (rs) => {
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
  setupDataChannel(type: number) {
    if (type==1 || type==3) {
      this.conn.joinToRoom(localStorage['ConnectedGarden'], (rs) => {
        // [Sự kiện]: Dữ liệu từ vườn gửi đến các app đang kết nối
        if (!this.attachGardenEvent) {
          this.attachGardenEvent = true;
          this.conn.wsOn("GardenEvent", (data) => this.onGardenEvent(data));
        }
      });
    }
    // if (type==2 || type==3) {
    //   this.conn.localSocket.send(this.gardenProto.buildPackage([2,1], ''));
    // }
  }

  onGardenEvent(data) {
    let info = JSON.parse(data);
    if (info.emulate_device) {

      let lightRating = <any>document.getElementById("light-rating-mask");
      let length = lightRating.getTotalLength() + 90;
      lightRating.setAttributeNS(undefined, "stroke-dasharray", ""+length);
      lightRating.setAttributeNS(undefined, "stroke-dashoffset", ""+((1 - this.staInfo.envs['light'].pt/10) * length));
    }
  }

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
        // if (pkg.sub1 == 1) this.loadGardenState(pkg.msg);
        this.updateGardenState(pkg.msg);
        break;
    
      default:
        break;
    }
  }

  updateGardenState(data) {
    try {
      data = JSON.parse(data);
    } catch (err) {
      console.log(err);
    }
    console.log(data);

    for (let factor in data.state) {
      this.station.state[factor] = data.state[factor];
    }
    for (let factor in data.evaluations) {
      this.station.evaluations[factor] = data.evaluations[factor];
    }
    
    let lightRating = <any>document.getElementById("light-rating-mask");
    let length = lightRating.getTotalLength() + 90;
    lightRating.setAttributeNS(undefined, "stroke-dasharray", ""+length);
    lightRating.setAttributeNS(undefined, "stroke-dashoffset", ""+((1 - this.station.evaluations.light/10) * length));
  }


  /************************************************************************
   *                             UI Event Area                            *
   ************************************************************************/

  /** Sự kiện người dùng click chuyển giao diện */
  curSlide: number = 1;
  onChangeSlide(slide) {
    this.curSlide = slide;
  }

  /** Sự kiện click vào thiết bị */
  focusCtl: any;
  activeTool: boolean = false;
  onFocusCtl(ctl) {
    if (!this.focusCtl) this.focusCtl = ctl.equipment;
    else this.focusCtl = ctl.equipment == this.focusCtl ? null : ctl.equipment;
    this.activeTool = this.focusCtl != null;
  }

  onToggleControl(ctl, e) {
    e.stopImmediatePropagation();
    ctl.state = ctl.state == "off" ? "on" : "off";
    this.conn.wsSend("ControlGarden", { device: ctl.name, state: ctl.state });
  }

}
