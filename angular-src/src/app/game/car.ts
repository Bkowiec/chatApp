import * as box2d from "./Box2D/Box2D";


export class Car {
  public hz: number = 0.0;
  public zeta: number = 0.0;
  public speed: number = 0.0;
  public car: box2d.b2Body;
  public wheel1: box2d.b2Body;
  public wheel2: box2d.b2Body;
  public spring1: box2d.b2WheelJoint;
  public spring2: box2d.b2WheelJoint;
  private x: number = 0;

  constructor(private world: box2d.b2World) {
    this.initParams();
  }

  public moveForward(): void {
    this.spring1.SetMotorSpeed(this.speed);
    // this.x += 5;
  }

  public moveBackward(): void {
    this.spring1.SetMotorSpeed(-this.speed);
    // this.x -= 5;

  }

  public break(): void {
    this.spring1.SetMotorSpeed(0.0);
  }

  public getX(): number {
    // return this.x;
    return this.car.GetPosition().x;
  }

  public create() {
    const chassis: box2d.b2PolygonShape = new box2d.b2PolygonShape();
    const vertices: box2d.b2Vec2[] = box2d.b2Vec2.MakeArray(8);
    vertices[0].Set(-1.5, -0.5);
    vertices[1].Set(1.5, -0.5);
    vertices[2].Set(1.5, 0.0);
    vertices[3].Set(0.0, 0.9);
    vertices[4].Set(-1.15, 0.9);
    vertices[5].Set(-1.5, 0.2);
    chassis.Set(vertices, 6);

    const circle: box2d.b2CircleShape = new box2d.b2CircleShape();
    circle.m_radius = 0.4;

    const bd: box2d.b2BodyDef = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 1.0);
    this.car = this.world.CreateBody(bd);
    this.car.CreateFixture(chassis, 1.0);

    const fd: box2d.b2FixtureDef = new box2d.b2FixtureDef();
    fd.shape = circle;
    fd.density = 20.0;
    fd.friction = 0.9;

    bd.position.Set(-1.0, 0.35);
    this.wheel1 = this.world.CreateBody(bd);
    this.wheel1.CreateFixture(fd);

    bd.position.Set(1.0, 0.4);
    this.wheel2 = this.world.CreateBody(bd);
    this.wheel2.CreateFixture(fd);

    const jd: box2d.b2WheelJointDef = new box2d.b2WheelJointDef();
    const axis: box2d.b2Vec2 = new box2d.b2Vec2(0.0, 1.0);

    jd.Initialize(this.car, this.wheel1, this.wheel1.GetPosition(), axis);
    jd.motorSpeed = 0.0;
    jd.maxMotorTorque = 200.0;
    jd.enableMotor = true;
    jd.frequencyHz = this.hz;
    jd.dampingRatio = this.zeta;
    this.spring1 = this.world.CreateJoint(jd);

    jd.Initialize(this.car, this.wheel2, this.wheel2.GetPosition(), axis);
    jd.motorSpeed = 0.0;
    jd.maxMotorTorque = 100.0;
    jd.enableMotor = false;
    jd.frequencyHz = this.hz;
    jd.dampingRatio = this.zeta;
    this.spring2 = this.world.CreateJoint(jd);
  }

  private initParams() {
    this.hz = 40.0;
    this.zeta = 10.7;
    this.speed = 50.0;
  }
}
