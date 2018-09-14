import {Component, EventEmitter, OnInit, Output} from "@angular/core";

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.css']
})
export class GameMenuComponent implements OnInit {
  @Output() private carChosen: EventEmitter<string> = new EventEmitter<string>();
  constructor() {
  }

  ngOnInit() {

  }

  onCarChosenButtonClicked(name: string) {
    console.log(name);
    this.carChosen.emit(name);
  }
}
