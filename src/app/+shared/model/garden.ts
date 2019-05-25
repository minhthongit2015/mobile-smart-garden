
/** Lớp mô tả cây trồng trên trạm */
export class UserPlant {
  type: string;

  constructor(type: string) {
    this.type = type;
  }
}


/** Lớp mô tả thông tin khái quát trạm */
export class Station {
  id: string;
  name: string;
  plants: UserPlant[];
  equipments: any[];
  automation_mode: boolean;
  state: any;
  evaluations: any;
  private _controls: any[];

  style: string;
  focus: boolean = false; // Lưu trạng thái đang được người dùng click vào hay không

  _position: any;
  set position(pos: any) {
    this._position = pos;
  }
  get position(): any {
    return `translate(calc(${this._position[1]*100}% + ${this._position[1]*10}px), 
    calc(${this._position[0]*100}% + ${this._position[0]*10}px))`;
  }

  get width() {
    switch (this.style) {
      case 'b1': return 'calc(33.33% - 10px)';
      case 'v2': case 'v3': return 'calc(33.33% - 10px)';
      case 'h2': case 'h3': return 'calc(66.66% - 10px)';
      case 'h4': case 'h5': return 'calc(100% - 10px)';
      case 'b4': case 'b5': case 'b6': return 'calc(66.66% - 10px)';
    }
  }
  get height() {
    switch (this.style) {
      case 'b1': return 'calc(33.33% - 10px)';
      case 'v2': case 'v3': return 'calc(66.66% - 10px)';
      case 'h2': case 'h3': return 'calc(33.33% - 10px)';
      case 'h4': case 'h5': return 'calc(33.33% - 10px)';
      case 'b4': case 'b5': case 'b6': return 'calc(66.66% - 10px)';
    }
  }
  get direction() {
    switch (this.style[0]) {
      case 'b': case 'h': return 'row';
      case 'v': return 'column';
    }
  }
  
  rating(pt) {
    if (pt > 8) return 'good';
    if (pt > 5) return 'norm';
    if (pt > 3) return 'warn';
    return 'danger';
  }
  
  pointRange(point) {
    return [1,2,3,4,5,6,7,8,9,10].slice(0,point).reverse();
    // return [...new Array(parseInt(pt))].map((v,i) => i).reverse();
  }

  get controls() {
    let controls = [];
    for (let equipment of this.equipments) {
      for (let role of equipment.roles) {
        if (role != "sensors") {
          controls.push({
            type: role,
            name: equipment.name,
            state: equipment.state[role] === true ? "on" : "off",
            focus: equipment.focus,
            equipment: equipment
          })
        }
      }
    }
    return controls;
  }

  constructor(obj = { id: "", name: "", plants: [], equipments: [], automation_mode: true, state: {}, evaluations: {}, style: "", position: [] }) {
    for (let i in obj) {
      this[i] = obj[i];
    }
    // this.name = obj.name;
    // this.id = obj.id;
    // this.plants = obj.plants;
    // this.equipments = obj.equipments;
    // this.automation_mode = obj.automation_mode;
    // this.style = obj.style;
    // this.position = obj.position;
  }
}



/** Lớp mô tả dữ liệu chi tiết từng trạm */
export class StationDetail {
  envs: any;
  ctls: any;

  constructor(envs={}, ctls={}) {
    this.envs = envs;
    this.ctls = ctls;
  }

  rating(pt) {
    if (pt > 8) return 'good';
    if (pt > 5) return 'norm';
    if (pt > 3) return 'warn';
    return 'danger';
  }

  range(pt) {
    return [1,2,3,4,5,6,7,8,9,10].slice(0,pt).reverse();
    // return [...new Array(parseInt(pt))].map((v,i) => i).reverse();
  }
}


/** Lớp mô tả thông tin tổng quát vườn */
export class SmartGarden {
  name?: string;
  id?: string;
  protected?: boolean;
  localIP?: string;
  location?: string;
  stations?: Station[] = [];

  constructor(info: object = {}, stations: Station[] = []) {
    this.stations = stations;
    this.loadByObj(info);
  }

  loadByJson(infoJson) {
    let info = {};
    try {
      info = JSON.parse(infoJson);
    } catch (err) {
      console.log(err);
    }
    this.loadByObj(info);
  }

  loadByObj(infoObj) {
    for (let i in infoObj) {
      this[i] = infoObj[i];
    }
    this.calcStationVisualize();
  }

  calcStationVisualize() {
    let styles = [
      "b1", "b1", "v3", "h3"
    ]
    let pos = [
      [0,0], [0,1], [0,2], [1,0]
    ]
    if (this.stations.length > 0) {
      if (!(this.stations[0] instanceof(Station))) {
        this.stations = this.stations.map(sta => new Station(sta));
      }
      let stations = this.stations;
      for (let i in stations) {
        stations[i].style = styles[i];
        stations[i].position = pos[i];
      }
    }
  }
}