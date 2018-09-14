import {AbstractCar} from "./abstract.car";
import * as box2d from "../Box2D/Box2D";
import {CarSettings} from "./car.settings";

export class HulkCar extends AbstractCar {
  public car: box2d.b2Body;
  public wheel1: box2d.b2Body;
  public wheel2: box2d.b2Body;
  public spring1: box2d.b2WheelJoint;
  public spring2: box2d.b2WheelJoint;

  constructor(world: box2d.b2World, settings: CarSettings) {
    super(world, settings);
  }

  create(): void {

    const circle: box2d.b2CircleShape = new box2d.b2CircleShape();
    circle.m_radius = 1.5;

    const bd: box2d.b2BodyDef = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 1.75);
    this.car = this.world.CreateBody(bd);

    const chassis: box2d.b2PolygonShape = new box2d.b2PolygonShape();
    chassis.SetAsBox(4, 0.5);
    this.car.CreateFixture(chassis, 1.0);

    const vertices: box2d.b2Vec2[] = box2d.b2Vec2.MakeArray(8);
    vertices[0].Set(0, 0.5);
    vertices[1].Set(3.0, 0.5);
    vertices[2].Set(1.5, 2.0);
    vertices[3].Set(0.0, 2.0);
    chassis.Set(vertices, 4);
    this.car.CreateFixture(chassis);

    const fd: box2d.b2FixtureDef = new box2d.b2FixtureDef();
    fd.shape = circle;
    fd.density = 10.0;
    fd.friction = 1.0;

    bd.position.Set(-2.5, 0.35);
    this.wheel1 = this.world.CreateBody(bd);
    this.wheel1.CreateFixture(fd);

    bd.position.Set(2.5, 0.4);
    this.wheel2 = this.world.CreateBody(bd);
    this.wheel2.CreateFixture(fd);

    const jd: box2d.b2WheelJointDef = new box2d.b2WheelJointDef();
    const axis: box2d.b2Vec2 = new box2d.b2Vec2(0.0, 1.0);

    jd.Initialize(this.car, this.wheel1, this.wheel1.GetPosition(), axis);
    jd.motorSpeed = 0.0;
    jd.maxMotorTorque = this.settings.maxMotorTorque;
    jd.enableMotor = true;
    jd.frequencyHz = this.settings.hz;
    jd.dampingRatio = this.settings.zeta;
    this.spring1 = this.world.CreateJoint(jd);

    jd.Initialize(this.car, this.wheel2, this.wheel2.GetPosition(), axis);
    jd.motorSpeed = 0.0;
    jd.maxMotorTorque = this.settings.maxMotorTorque;
    jd.enableMotor = false;
    jd.frequencyHz = this.settings.hz;
    jd.dampingRatio = this.settings.zeta;
    this.spring2 = this.world.CreateJoint(jd);
  }

  getX(): number {
    return this.car.GetPosition().x;
  }

  getY(): number {
    return this.car.GetPosition().y;
  }

  moveBackward(): void {
    this.spring1.SetMotorSpeed(-this.settings.speed);
  }

  moveForward(): void {
    this.spring1.SetMotorSpeed(this.settings.speed);
  }

  stop(): void {
    this.spring1.SetMotorSpeed(0);
  }

}
