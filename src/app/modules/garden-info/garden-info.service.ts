import { Injectable } from '@angular/core';
import { HttpClient } from  '@angular/common/http';
import { tap } from  'rxjs/operators';
import { Observable, BehaviorSubject } from  'rxjs';
import { Storage } from  '@ionic/storage';
import { GardenInfo } from  './garden-info';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GardenInfoService {
  SERVER_ADDRESS: string = 'http://localhost:5000/apis/garden';
  private gardens = new BehaviorSubject([]);

  constructor(private  httpClient: HttpClient,
    private storage: Storage,
    private authService: AuthService,
    ) {
    // this.storage.get('ACCESS_TOKEN').then(access_token => {
    //   this.login({ accessToken: access_token }).subscribe();
    // });
  }

  async getAllGardens() {
    return this.storage.get('ACCESS_TOKEN').then((accessToken) => {
      return this.httpClient.get(`${this.SERVER_ADDRESS}/list`, {
        headers: {
          token: accessToken
        }
      }).pipe(
        tap(async (gardens: GardenInfo[]) => {
          if (gardens) {
            this.gardens.next(gardens);
          }
        })
      );
    });
  }

  requestAccess(gardenId) : Observable<any> {
    return this.httpClient.get(`${this.SERVER_ADDRESS}/request-access/${gardenId}`, {
      headers: {
        token: this.authService.accessToken
      }
    });
  }
}
