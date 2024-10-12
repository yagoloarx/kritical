// src/app/avaliacao/avaliacao.page.ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-avaliacao',
  templateUrl: './avaliacao.page.html',
  styleUrls: ['./avaliacao.page.scss'],
})
export class AvaliacaoPage {
  gameId: number;

  constructor(private route: ActivatedRoute) {
    this.gameId = Number(this.route.snapshot.paramMap.get('id'));
  }
}
