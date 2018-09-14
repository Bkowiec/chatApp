import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameScoreService} from '../../services/game.score.service';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-game-score',
  templateUrl: './game-score.component.html',
  styleUrls: ['./game-score.component.scss']
})
export class GameScoreComponent implements OnInit, OnDestroy {

  public gameScores: any[];
  constructor(
    private authService: AuthService,
    private gameScoreService: GameScoreService
  ) {
  }


  ngOnInit() {
    this.gameScoreService.getAll().subscribe(result => {
      this.gameScores = result.gameScores;
    });
  }

  ngOnDestroy(): void {
  }

}
