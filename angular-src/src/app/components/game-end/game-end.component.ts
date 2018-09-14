import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
  selector: 'app-game-end',
  templateUrl: './game-end.component.html',
  styleUrls: ['./game-end.component.css']
})
export class GameEndComponent implements OnInit {
  @Input('gameScore') gameScore: number = 0;
  @Output() private playAgain: EventEmitter<any> = new EventEmitter<any>();
  @Output() private saveGameScore: EventEmitter<number> = new EventEmitter<number>();
  constructor() {
  }

  ngOnInit() {

  }

  onPlayAgainButtonClicked() {
    this.playAgain.emit();
  }

  onSaveBestScoreButtonClicked() {
    this.saveGameScore.emit(this.gameScore);
  }
}
