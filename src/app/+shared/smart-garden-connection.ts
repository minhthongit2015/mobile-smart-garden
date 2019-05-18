

export class Package {
  cmd; sub1; sub2; msg;

  get headers() { return String.fromCharCode(...this.cmds) }
  get cmds() { return [this.cmd, this.sub1, this.sub2] }

  constructor(header, msg) {
    this.cmd = header ? header.charCodeAt(0) : '\xf4';
    this.sub1 = header ? header.charCodeAt(1) : '\xf4';
    this.sub2 = header ? header.charCodeAt(2) : '\xf4';
    this.msg = msg;
  }
}

export class StandardProtocol {
  pkgcfg;

  constructor() {
    this.pkgcfg = {start: '\xfd', delim: '\xfe', end: '\xff', def: '\xf4'}
  }

  unpack(msg) {
    let pack, header, data;
    let rest = "";
    let packages = [];

    do {
      let iEnd = msg.indexOf(this.pkgcfg.end);
      if (iEnd < 0) return null;
      
      pack = msg.substr(1, iEnd - 1);
      rest = msg.substr(iEnd + this.pkgcfg.end.length);
  
      // Header_D_Data
      pack = pack.split(this.pkgcfg.delim);
      header = pack[0];
      data = pack[1];

      packages.push(new Package(header, data));
    } while (rest);

    return packages;
  }

  pack(cmds, msg, accessCode='') {
    let headers = this.buildHeader(cmds);
    let packagez = `${this.pkgcfg.start}${accessCode}${this.pkgcfg.delim}${headers}${this.pkgcfg.delim}${msg}${this.pkgcfg.end}`;
    return packagez;
  }
  
  buildHeader(cmds) {
    if (!cmds.length) cmds = [cmds];
    if (cmds.length == 1) cmds.push(this.pkgcfg.def.charCodeAt(0));
    if (cmds.length == 2) cmds.push(this.pkgcfg.def.charCodeAt(0));
    return String.fromCharCode(...cmds);
  }
}

export class ConnectionManager {
  public proto: StandardProtocol;

  constructor() {
    this.proto = new StandardProtocol();
  }

  packagesResolve(data) {
    return this.proto.unpack(data) || [];
  }

  buildPackage(cmds, data) {
    return this.proto.pack(cmds, data);
  }
}