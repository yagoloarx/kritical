// src/app/todos-jogos/todos-jogos.page.ts

import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { RawgService } from '../services/rawg.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-todos-jogos',
  templateUrl: './todos-jogos.page.html',
  styleUrls: ['./todos-jogos.page.scss'],
})
export class TodosJogosPage implements OnInit {
  searchTerm: string = '';
  selectedCategory: string = 'Todos';
  showCategorySelector: boolean = false;
  categories: any[] = [];
  allGames: any[] = [];
  filteredGames: any[] = [];
  isLoading: boolean = false;

  currentPage: number = 1;
  pageSize: number = 20; // Número de jogos a carregar por vez
  totalGamesLoaded: number = 0; // Total de jogos carregados
  limit: number = 50; // Limite máximo de jogos

  private searchSubject: Subject<string> = new Subject();

  constructor(
    private navCtrl: NavController,
    private rawgService: RawgService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadGenres();
    this.loadGames();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1; // Reinicia a página ao buscar
      this.loadGames();
    });
  }

  loadGenres() {
    this.rawgService.getGenres().subscribe(
      data => {
        this.categories = data.results.map((genre: any) => genre.slug);
      },
      error => {
        console.error('Erro ao carregar gêneros', error);
      }
    );
  }

  async loadGames(loadMore: boolean = false, event?: any) {
    // Verifica se já atingiu o limite de jogos
    if (this.totalGamesLoaded >= this.limit) {
      if (event) {
        event.target.complete(); // Finaliza o evento se não houver mais jogos
      }
      return; // Não há mais jogos para carregar
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: loadMore ? 'Carregando mais jogos...' : 'Carregando jogos...',
    });
    await loading.present();

    const pageToLoad = loadMore ? this.currentPage + 1 : 1;

    this.rawgService.getGames(pageToLoad, this.pageSize, this.searchTerm, this.selectedCategory !== 'Todos' ? this.selectedCategory : '')
      .subscribe(
        data => {
          if (loadMore) {
            this.allGames = [...this.allGames, ...data.results];
            this.currentPage++;
          } else {
            this.allGames = data.results;
            this.currentPage = 1;
          }

          // Adiciona os novos jogos ao total carregado
          this.totalGamesLoaded = this.allGames.length > this.limit ? this.limit : this.allGames.length;

          this.filterGames();
          loading.dismiss();
          this.isLoading = false;

          if (loadMore && event) {
            event.target.complete();
          }
        },
        async error => {
          loading.dismiss();
          this.isLoading = false;
          const toast = await this.toastController.create({
            message: 'Erro ao carregar jogos.',
            duration: 2000,
            color: 'danger'
          });
          toast.present();

          if (loadMore && event) {
            event.target.complete();
          }
        }
      );
  }

  loadMoreGames(event: any) {
    this.loadGames(true, event);
  }

  filterGames() {
    if (this.selectedCategory === 'Todos' && !this.searchTerm) {
      this.filteredGames = this.allGames.slice(0, this.limit); // Limita os jogos filtrados
    } else {
      this.filteredGames = this.allGames.filter(game => {
        const matchesTitle = game.name.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesCategory = this.selectedCategory === 'Todos' || game.genres.some((genre: any) => genre.slug === this.selectedCategory);
        return matchesTitle && matchesCategory;
      }).slice(0, this.limit); // Limita os jogos filtrados
    }
  }

  getGenresString(game: any): string {
    if (game.genres && game.genres.length > 0) {
      return game.genres.map((g: any) => g.name).join(', ');
    }
    return '';
  }

  goToAvaliacao(game: any) {
    this.navCtrl.navigateForward('/avaliacao'); // Navega para a página de avaliação
  }

  onSearchChange(searchValue: string) {
    this.searchSubject.next(searchValue);
  }
}
