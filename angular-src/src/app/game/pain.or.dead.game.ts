import * as box2d from "./Box2D/Box2D";
import {GroundCreator} from "./ground/ground.creator";
import {ShapeDrawer} from "./shape.drawer";
import {NiceGuyFactory} from "./niceguy/nice.guy.factory";
import {BunchOfNiceGuys} from "./niceguy/bunch.of.nice.guys";
import {NiceGuySize} from "./niceguy/nice.guy.size";
import {AbstractCar} from "./cars/abstract.car";
import {HulkCar} from "./cars/hulk.car";
import {SpidermanCar} from "./cars/spiderman.car";
import {BodyType} from "./niceguy/body.type";
import {GameStepInfo} from "./game.step.info";

export class PainOrDeadGame extends box2d.b2ContactListener {
  private readonly gameTimeMillis: number;
  private isPostSolveExecuted;
  private score: number = 0;
  private gameInfo: GameStepInfo;
  private endTime: number;
  private readonly world: box2d.b2World;
  private groundCreator: GroundCreator;
  private car: AbstractCar;
  private bunchOfNiceGuys: BunchOfNiceGuys;

  constructor(shapeDrawer: ShapeDrawer, gameTimeMillis: number, carType: string) {
    super();
    this.gameTimeMillis = gameTimeMillis;
    this.world = this.createWorld(shapeDrawer);
    this.groundCreator = new GroundCreator(this.world);
    this.car = this.getCarByType(carType);
    const niceGuyFactory = new NiceGuyFactory(this.world);
    this.bunchOfNiceGuys = new BunchOfNiceGuys(niceGuyFactory);

    this.world.SetContactListener(this);
  }

  public create(): void {
    this.groundCreator.create();
    this.car.create();
    this.createBunchOfNiceGuys();
    this.endTime = new Date().getTime() + this.gameTimeMillis;
  }

  public PostSolve(contact: box2d.b2Contact, impulse: box2d.b2ContactImpulse) {
    if (this.isPostSolveExecuted) {
      return;
    }
    this.gameInfo = null;
    const attackedNiceGuys: { id: number, isDead: boolean, impulse: number, bodyType: BodyType }[] = this.bunchOfNiceGuys.postSolve(contact, impulse);
    if (attackedNiceGuys.length === 0) {
      return;
    }
    // console.log('num of attacked nice guys: ' + attackedNiceGuys.length);
    this.score += this.calculateGameScore(attackedNiceGuys);
    const deadNiceGuyIndex = attackedNiceGuys.findIndex(attackedNiceGuy => attackedNiceGuy.isDead);
    this.gameInfo = {isPain: true, isDead: deadNiceGuyIndex !== -1};
    this.isPostSolveExecuted = true;
  }

  getCarX(): number {
    return this.car.getX();
  }

  getCarY(): number {
    return this.car.getY();
  }

  getTimeLeft(): number {
    return this.endTime - new Date().getTime();
  }

  step(timeStep: number, velocityIterations: number, positionIterations: number, particleIterations: number) {
    this.isPostSolveExecuted = false;
    this.world.Step(timeStep, velocityIterations, positionIterations, particleIterations);
  }

  updateBodiesState() {
    this.bunchOfNiceGuys.updateBodiesState();
  }

  draw() {
    this.world.DrawDebugData();
  }

  moveCarForward() {
    this.car.moveForward();
  }

  moveCarBackward() {
    this.car.moveBackward();
  }

  stopEngine() {
    this.car.stop();
  }

  getScore(): number {
    return this.score;
  }

  getGameStepInfo(): GameStepInfo {
    return this.gameInfo;
  }

  isGameFinished() {
    if (this.getTimeLeft() <= 0) {
      return true;
    }
    if (this.car.getY() <= -15) {
      return true;
    }
    if (this.car.getX() >= this.groundCreator.getMapEndX()) {
      this.score += this.calculateEndingScorePoints();
      return true;
    }
    return false;
  }

  private getCarByType(carType: string): AbstractCar {
    if (carType === "hulk") {
      const carSettings = {hz: 40, zeta: 0.5, speed: 300, maxMotorTorque: 1500};
      return new HulkCar(this.world, carSettings)
    } else {
      const carSettings = {hz: 40, zeta: 0.5, speed: 30, maxMotorTorque: 1500};
      return new SpidermanCar(this.world, carSettings);
    }
  }

  private createWorld(shapeDrawer: ShapeDrawer): box2d.b2World {
    const particleSystemDef = new box2d.b2ParticleSystemDef();
    const gravity: box2d.b2Vec2 = new box2d.b2Vec2(0, -10);
    const world: box2d.b2World = new box2d.b2World(gravity);
    const particleSystem = world.CreateParticleSystem(particleSystemDef);

    world.SetDebugDraw(shapeDrawer);

    particleSystem.SetGravityScale(0.4);
    particleSystem.SetDensity(1.2);

    return world;
  }

  private createBunchOfNiceGuys() {
    this.bunchOfNiceGuys.create(NiceGuySize.NORMAL_GUY, 15, 0);
    this.bunchOfNiceGuys.create(NiceGuySize.SMALL_GUY, 43, 0);
    this.bunchOfNiceGuys.create(NiceGuySize.NORMAL_GUY, 72, 0.8);
    this.bunchOfNiceGuys.create(NiceGuySize.BIG_GUY, 105, 0);
    this.bunchOfNiceGuys.create(NiceGuySize.NORMAL_GUY, 155, 0);
    this.bunchOfNiceGuys.create(NiceGuySize.NORMAL_GUY, 215, 0);
    this.bunchOfNiceGuys.create(NiceGuySize.BIG_GUY, 270, 0);
    this.bunchOfNiceGuys.create(NiceGuySize.SMALL_GUY, 342, 11);
    this.bunchOfNiceGuys.create(NiceGuySize.NORMAL_GUY, 382, 10.0);
    this.bunchOfNiceGuys.create(NiceGuySize.NORMAL_GUY, 450, 5.0);
    this.bunchOfNiceGuys.create(NiceGuySize.NORMAL_GUY, 490, 20.0);
    this.bunchOfNiceGuys.create(NiceGuySize.BIG_GUY, 510, 10.0);
    this.bunchOfNiceGuys.create(NiceGuySize.SMALL_GUY, 570, 0);
  }

  private calculateGameScore(attackedNiceGuys: { id: number; isDead: boolean; impulse: number; bodyType: BodyType }[]): number {
    let stepScore = 0;
    attackedNiceGuys.forEach(attackedNiceGuy => {
      if (attackedNiceGuy.isDead) {
        // console.log('is dead, id: ', attackedNiceGuy.id);
        stepScore += 1000;
      }
      let scoreMultiply = 0;
      if (attackedNiceGuy.bodyType == BodyType.HEAD) {
        scoreMultiply += 3;
      }
      if (attackedNiceGuy.bodyType == BodyType.ARM) {
        scoreMultiply = 2;
      }
      if (attackedNiceGuy.bodyType == BodyType.LEG) {
        scoreMultiply = 1;
      }
      stepScore += scoreMultiply * attackedNiceGuy.impulse;
    });
    return Math.round(stepScore);
  }

  private calculateEndingScorePoints(): number {
    let endScore = 5000;
    endScore += Math.round(this.getTimeLeft() / 10);
    return endScore;
  }
}
