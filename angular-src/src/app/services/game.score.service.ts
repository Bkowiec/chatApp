import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../environments/environment';

const BASE_URL = environment.backendUrl;


@Injectable()
export class GameScoreService {
  private options;
  private domain = `${BASE_URL}`;


  constructor(
    private authService: AuthService,
    private http: Http
  ) { }

  createAuthenticationHeaders() {
    this.options = new RequestOptions({
      headers: new Headers({
        'Content-Type': 'application/json',
        'authorization': this.authService.authToken
      })
    });
  }
  save(gameScoreToSave: { carType: string; score: number; createdBy: any }) {
    this.createAuthenticationHeaders();
    return this.http.post(this.domain + '/games', gameScoreToSave, this.options).map(res => res.json());

  }

  getAll(): Observable<any> {
    this.createAuthenticationHeaders();
    return this.http.get(this.domain + '/games', this.options).map(res => res.json());
  }
}
