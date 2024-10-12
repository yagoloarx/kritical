// src/app/services/rawg.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RawgService {
  private API_URL = 'https://api.rawg.io/api';
  private API_KEY = '79ea2fa95be74b4382a7ee23105c5c15'; // Substitua pela sua chave de API

  constructor(private http: HttpClient) { }

  getGames(page: number = 1, pageSize: number = 20, search: string = '', genres: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('key', this.API_KEY)
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (genres) {
      params = params.set('genres', genres);
    }

    return this.http.get(`${this.API_URL}/games`, { params });
  }

  getGenres(): Observable<any> {
    let params = new HttpParams()
      .set('key', this.API_KEY);

    return this.http.get(`${this.API_URL}/genres`, { params });
  }
}

