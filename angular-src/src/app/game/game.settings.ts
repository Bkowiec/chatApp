import * as box2d from "./Box2D/Box2D";

export class GameSettings {
  public hz: number = 60;
  public velocityIterations: number = 8;
  public positionIterations: number = 1;
  public animationFramesPerGameInfo = 240;
  public particleIterations: number = box2d.b2CalculateParticleIterations(10, 0.04, 1 / this.hz);
  public drawShapes: boolean = true;
  public drawParticles: boolean = true;
  public drawJoints: boolean = false;
  public drawAABBs: boolean = false;
  public drawContactPoints: boolean = false;
  public drawContactNormals: boolean = false;
  public drawContactImpulse: boolean = false;
  public drawFrictionImpulse: boolean = false;
  public drawCOMs: boolean = false;
  public drawControllers: boolean = true;
  public drawStats: boolean = false;
  public drawProfile: boolean = false;
  public enableWarmStarting: boolean = true;
  public enableContinuous: boolean = true;
  public enableSubStepping: boolean = false;
  public enableSleep: boolean = true;
  public pause: boolean = false;
  public singleStep: boolean = false;
  public strictContacts: boolean = false;
}
