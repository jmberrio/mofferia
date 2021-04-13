import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Partida } from './app.interfaces';
import { environment } from '../environments/environments';

@Injectable()
export class BestScoreManager {

  private ngxSnake = 'ngx_snake';
  private url = environment.apiRestUrl;

  constructor(private httpClient: HttpClient) {}

  public store(score: number) {
    localStorage.setItem(this.ngxSnake, JSON.stringify({ 'best_score': score }));
  }

  public retrieve() {
    let storage = this.parse();
    if (!storage) {
      this.store(0);
      storage = this.parse();
    }

    return storage.best_score;
  }

  private parse() {
    return JSON.parse(localStorage.getItem(this.ngxSnake));
  }

  
  public guardarPartida(partida: Partida): Observable<Partida> {
      
    const url = `${environment.apiRestUrl}/partidas.json?key=${environment.apiKey}`;
    return this.httpClient.post<Partida>(url, partida);
  }
}
