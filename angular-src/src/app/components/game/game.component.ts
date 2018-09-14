import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Camera} from "../../game/camera";
import {ShapeDrawer} from "../../game/shape.drawer";
import {GameSettings} from "../../game/game.settings";
import {PainOrDeadGame} from "../../game/pain.or.dead.game";
import {GameStepInfo} from "../../game/game.step.info";
import {AuthService} from "../../services/auth.service";
import {GameScoreService} from "../../services/game.score.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  public score: number = 0;
  public timeLeft: string;
  public gameStarted = false;
  public gameEnded = false;
  public isPain: boolean = false;
  public isDead: boolean = false;
  public showStartInfo: boolean = true;
  @ViewChild('gameCanvas') canvasRef: ElementRef;
  private ctx: CanvasRenderingContext2D;
  private requestAnimationFrameId: number;
  private settings: GameSettings;
  private painOrDeadGame: PainOrDeadGame;
  private leftArrowPressed: boolean = false;
  private rightArrowPressed: boolean = false;
  private upArrowPressed: boolean = false;
  private downArrowPressed: boolean = false;
  private chosenCarType: string;
  private numOfFramesToShowGameInfo = 0;
  private username;
  constructor(
    private authService: AuthService,
    private gameScoreService: GameScoreService,
    private router: Router,
    private camera: Camera,
    private shapeDrawer: ShapeDrawer
  ) {
  }


  ngOnInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    this.shapeDrawer.ctx = this.ctx;

    this.authService.getProfile().subscribe(profile => {
      this.username = profile.user.username;
    });
  }

  ngOnDestroy(): void {
    this.isPain = false;
    this.isDead = false;
    this.gameStarted = false;
    this.settings = null;
    this.score = 0;
    window.cancelAnimationFrame(this.requestAnimationFrameId);
    this.painOrDeadGame = null;
  }

  @HostListener('document:keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === "ArrowLeft") {

      this.leftArrowPressed = true;
    }
    if (event.key == "ArrowRight") {
      this.rightArrowPressed = true;
    }
    if (event.key == "ArrowUp") {
      this.upArrowPressed = true;
    }
    if (event.key == "ArrowDown") {
      this.downArrowPressed = true;
    }
    event.stopPropagation();
  }

  @HostListener('document:keyup', ['$event'])
  public onKeyUp(event: KeyboardEvent): void {
    if (event.key === "ArrowLeft") {
      this.leftArrowPressed = false;
    }
    if (event.key == "ArrowRight") {
      this.rightArrowPressed = false;
    }
    if (event.key == "ArrowUp") {
      this.upArrowPressed = false;
    }
    if (event.key == "ArrowDown") {
      this.downArrowPressed = false;
    }
    event.stopPropagation();
  }

  resetGame() {
    window.cancelAnimationFrame(this.requestAnimationFrameId);
    this.startGame();
  }

  onCarChosen(carType: string) {
    this.gameStarted = true;
    this.chosenCarType = carType;
    this.startGame();
  }

  onPlayAgainAfterGameEnd() {
    this.startGame();
  }

  onSaveGameScore(gameScore: number) {
    const gameScoreToSave = {
      carType: this.chosenCarType,
      score: gameScore,
      createdBy: this.username
    };
    this.gameScoreService.save(gameScoreToSave)
      .subscribe(result => {
        console.log(result);
        this.router.navigate(['/game-score']);
      });
  }

  private startGame() {
    this.gameStarted = true;
    this.gameEnded = false;
    this.showStartInfo = true;
    this.settings = new GameSettings();
    this.painOrDeadGame = new PainOrDeadGame(this.shapeDrawer, 3 * 60 * 1000, this.chosenCarType);
    this.painOrDeadGame.create();
    this.runGameLoop(this.ctx);
  }

  private finishGame() {
    console.log('game ended');
    this.score = this.painOrDeadGame.getScore();
    window.cancelAnimationFrame(this.requestAnimationFrameId);
    this.gameEnded = true;
  }

  private runGameLoop(ctx: CanvasRenderingContext2D): void {
    this.gameLoop(ctx);
    this.requestAnimationFrameId = window.requestAnimationFrame(time => {
      if (!this.painOrDeadGame.isGameFinished()) {
        this.runGameLoop(ctx);
      } else {
        this.finishGame();
      }
    });
  }

  private gameLoop(ctx: CanvasRenderingContext2D): void {

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();

    ctx.translate(0.5 * ctx.canvas.width, 0.5 * ctx.canvas.height);
    ctx.scale(1, -1);
    const s: number = 0.5 * this.camera.m_height / this.camera.m_extent;
    ctx.scale(s, s);
    ctx.lineWidth /= s;

    ctx.scale(1 / this.camera.m_zoom, 1 / this.camera.m_zoom);
    ctx.lineWidth *= this.camera.m_zoom;
    ctx.translate(-this.camera.m_center.x, -this.camera.m_center.y);

    this.step(this.settings);
    ctx.restore();
  }

  private step(settings: GameSettings): void {
    let timeStep = settings.hz > 0 ? 1 / settings.hz : 0;

    this.shapeDrawer.setDrawerFlags(this.settings);

    this.setCarAcceleration();

    this.camera.m_center.x = this.painOrDeadGame.getCarX();
    // this.camera.m_center.x = this.painOrDeadGame.getCarX();
    this.camera.m_center.y = this.painOrDeadGame.getCarY() + 2;

    this.painOrDeadGame.step(timeStep, settings.velocityIterations, settings.positionIterations, settings.particleIterations);
    this.painOrDeadGame.updateBodiesState();
    this.painOrDeadGame.draw();
    this.score = this.painOrDeadGame.getScore();
    this.timeLeft = this.timeToMinutesAndSecondsString(this.painOrDeadGame.getTimeLeft());
    this.setGameInfo(this.painOrDeadGame.getGameStepInfo());
  }

  private setCarAcceleration() {
    if (this.leftArrowPressed && this.rightArrowPressed) {
      this.painOrDeadGame.moveCarForward();
    } else if (this.leftArrowPressed) {
      this.painOrDeadGame.moveCarForward();
    } else if (this.rightArrowPressed) {
      this.painOrDeadGame.moveCarBackward();
    } else {
      this.painOrDeadGame.stopEngine();
    }

  }


  private setGameInfo(gameStepInfo: GameStepInfo) {
    this.numOfFramesToShowGameInfo++;
    if (this.numOfFramesToShowGameInfo >= this.settings.animationFramesPerGameInfo) {
      this.numOfFramesToShowGameInfo = 0;
      this.showStartInfo = true;
      this.isDead = false;
      this.isPain = false;
    }
    if (gameStepInfo === null) {
      return;
    }

    this.showStartInfo = false;
    if (gameStepInfo.isDead) {
      this.isDead = true;
      this.isPain = false;
    } else if (gameStepInfo.isPain) {
      this.isPain = true;
      this.isDead = false;
    }
  }

  private timeToMinutesAndSecondsString(time: number): string {
    const minutesValue = Math.floor(time / (60 * 1000));
    time -= minutesValue * 60 * 1000;
    const secondsValue = Math.floor(time / 1000);
    const minutes = minutesValue < 10 ? '0' + minutesValue : minutesValue;
    const seconds = secondsValue < 10 ? '0' + secondsValue : secondsValue;
    return `${minutes}:${seconds}`;
  }
}
