import * as box2d from "../Box2D/Box2D";
import {CarSettings} from "./car.settings";

export abstract class AbstractCar {
  protected constructor(protected world: box2d.b2World, protected settings: CarSettings) {
  }

  public abstract moveForward(): void;

  public abstract moveBackward(): void;

  public abstract getX(): number;

  public abstract getY(): number;

  public abstract create(): void;

  public abstract stop(): void;

  protected createMotorJoint(car: box2d.b2Body, wheel: box2d.b2Body): box2d.b2Joint {
    const jd = new box2d.b2WheelJointDef();
    const axis: box2d.b2Vec2 = new box2d.b2Vec2(0.0, 1.0);

    jd.Initialize(car, wheel, wheel.GetPosition(), axis);
    jd.motorSpeed = 0.0;
    jd.maxMotorTorque = 100.0;
    jd.enableMotor = true;
    jd.frequencyHz = this.settings.hz;
    jd.dampingRatio = this.settings.zeta;
    return this.world.CreateJoint(jd);
  }

}
