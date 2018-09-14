import * as box2d from "../Box2D/Box2D";

export class GroundCreator {
  private ground: box2d.b2Body;
  private mapEndX: number = 0;

  constructor(private world: box2d.b2World) {

  }

  public getMapEndX(): number {
    return this.mapEndX;
  }

  public create() {
    const bd: box2d.b2BodyDef = new box2d.b2BodyDef();
    this.ground = this.world.CreateBody(bd);

    const shape: box2d.b2EdgeShape = new box2d.b2EdgeShape();

    const fd: box2d.b2FixtureDef = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 0.0;
    fd.friction = 0.6;

    shape.Set(new box2d.b2Vec2(-20.0, 0.0), new box2d.b2Vec2(20.0, 0.0));
    this.ground.CreateFixture(fd);

    const hs: number[] = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0];

    let x: number = 20.0, y1: number = 0.0;
    const dx: number = 5.0;

    for (let i: number = 0; i < 10; ++i) {
      const y2: number = hs[i];
      shape.Set(new box2d.b2Vec2(x, y1), new box2d.b2Vec2(x + dx, y2));
      this.ground.CreateFixture(fd);
      y1 = y2;
      x += dx;
    }

    for (let i: number = 0; i < 10; ++i) {
      const y2: number = hs[i];
      shape.Set(new box2d.b2Vec2(x, y1), new box2d.b2Vec2(x + dx, y2));
      this.ground.CreateFixture(fd);
      y1 = y2;
      x += dx;
    }

    shape.Set(new box2d.b2Vec2(x, 0.0), new box2d.b2Vec2(x + 40.0, 0.0));
    this.ground.CreateFixture(fd);

    x += 80.0;
    shape.Set(new box2d.b2Vec2(x, 0.0), new box2d.b2Vec2(x + 40.0, 0.0));
    this.ground.CreateFixture(fd);

    x += 40.0;
    shape.Set(new box2d.b2Vec2(x, 0.0), new box2d.b2Vec2(x + 10.0, 5.0));
    this.ground.CreateFixture(fd);

    x += 20.0;
    shape.Set(new box2d.b2Vec2(x, 0.0), new box2d.b2Vec2(x + 40.0, 0.0));
    this.ground.CreateFixture(fd);

    x += 40.0;
    // shape.Set(new box2d.b2Vec2(x, 0.0), new box2d.b2Vec2(x, 20.0));
    this.ground.CreateFixture(fd);

    // Teeter
    {
      const bd: box2d.b2BodyDef = new box2d.b2BodyDef();
      bd.position.Set(140.0, 1.0);
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      const body: box2d.b2Body = this.world.CreateBody(bd);

      const box: box2d.b2PolygonShape = new box2d.b2PolygonShape();
      box.SetAsBox(10.0, 0.25);
      body.CreateFixture(box, 1.0);

      const jd: box2d.b2RevoluteJointDef = new box2d.b2RevoluteJointDef();
      jd.Initialize(this.ground, body, body.GetPosition());
      jd.lowerAngle = -8.0 * box2d.b2_pi / 180.0;
      jd.upperAngle = 8.0 * box2d.b2_pi / 180.0;
      jd.enableLimit = true;
      this.world.CreateJoint(jd);

      body.ApplyAngularImpulse(100.0);
    }

    // Bridge
    {
      const N: number = 20;
      const shape: box2d.b2PolygonShape = new box2d.b2PolygonShape();
      shape.SetAsBox(1.0, 0.125);

      const fd: box2d.b2FixtureDef = new box2d.b2FixtureDef();
      fd.shape = shape;
      fd.density = 10.0;
      fd.friction = 0.6;

      const jd: box2d.b2RevoluteJointDef = new box2d.b2RevoluteJointDef();

      let prevBody: box2d.b2Body = this.ground;
      for (let i: number = 0; i < N; ++i) {
        const bd: box2d.b2BodyDef = new box2d.b2BodyDef();
        bd.type = box2d.b2BodyType.b2_dynamicBody;
        bd.position.Set(161.0 + 2.0 * i, -0.125);
        const body: box2d.b2Body = this.world.CreateBody(bd);
        body.CreateFixture(fd);

        const anchor: box2d.b2Vec2 = new box2d.b2Vec2(160.0 + 2.0 * i, -0.125);
        jd.Initialize(prevBody, body, anchor);
        this.world.CreateJoint(jd);

        prevBody = body;
      }

      const anchor: box2d.b2Vec2 = new box2d.b2Vec2(160.0 + 2.0 * N, -0.125);
      jd.Initialize(prevBody, this.ground, anchor);
      this.world.CreateJoint(jd);
    }

    // Boxes
    {
      const box: box2d.b2PolygonShape = new box2d.b2PolygonShape();
      box.SetAsBox(0.5, 0.5);

      let body: box2d.b2Body;
      const bd: box2d.b2BodyDef = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;

      bd.position.Set(230.0, 0.5);
      body = this.world.CreateBody(bd);
      body.CreateFixture(box, 0.5);

      bd.position.Set(230.0, 1.5);
      body = this.world.CreateBody(bd);
      body.CreateFixture(box, 0.5);

      bd.position.Set(230.0, 2.5);
      body = this.world.CreateBody(bd);
      body.CreateFixture(box, 0.5);

      bd.position.Set(230.0, 3.5);
      body = this.world.CreateBody(bd);
      body.CreateFixture(box, 0.5);

      bd.position.Set(230.0, 4.5);
      body = this.world.CreateBody(bd);
      body.CreateFixture(box, 0.5);
    }

    this.createMountain();
    this.createBridge(new box2d.b2Vec2(390, 5));
    const pos = this.createRamp(new box2d.b2Vec2(430, 5));
    // pos.x = 0;
    this.createTeeter(pos);
    this.mapEndX = pos.x + 35;
  }

  private createMountain() {
    const hs: number[] = [0.25, 1.0, 4.0, 5.0, 5.0, 7.0, 9.0, 11.0, 11.0, 13.0, 16.5, 19.0, 20.0, 17.0, 14.0, 10.0, 10.0, 5.0];
    const shape: box2d.b2EdgeShape = new box2d.b2EdgeShape();
    const fd: box2d.b2FixtureDef = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 0.0;
    fd.friction = 0.6;

    let x: number = 300.0;
    let y1: number = 0.0;
    const dx: number = 5.0;

    for (let i: number = 0; i < hs.length; ++i) {
      const y2: number = hs[i];
      shape.Set(new box2d.b2Vec2(x, y1), new box2d.b2Vec2(x + dx, y2));
      this.ground.CreateFixture(fd);
      y1 = y2;
      x += dx;
    }


  }

  private createBridge(startPos: box2d.b2Vec2): void {

    const N: number = 20;
    const shape: box2d.b2PolygonShape = new box2d.b2PolygonShape();
    shape.SetAsBox(1.0, 0.125);

    const fd: box2d.b2FixtureDef = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 1.0;
    fd.friction = 0.6;

    const jd: box2d.b2RevoluteJointDef = new box2d.b2RevoluteJointDef();

    let prevBody: box2d.b2Body = this.ground;
    for (let i: number = 0; i < N; ++i) {
      const bd: box2d.b2BodyDef = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(startPos.x + 1 + 2.0 * i, startPos.y);
      const body: box2d.b2Body = this.world.CreateBody(bd);
      body.CreateFixture(fd);

      const anchor: box2d.b2Vec2 = new box2d.b2Vec2(startPos.x + 2.0 * i, startPos.y);
      jd.Initialize(prevBody, body, anchor);
      this.world.CreateJoint(jd);

      prevBody = body;
    }

    const anchor: box2d.b2Vec2 = new box2d.b2Vec2(startPos.x + 2.0 * N, startPos.y);
    jd.Initialize(prevBody, this.ground, anchor);
    this.world.CreateJoint(jd);

  }

  private createRamp(startPos: box2d.b2Vec2) {
    const hs: number[] = [0.25, 1.0, 4.0, 5.0, 5.0, 7.0, 9.0, 11.0, 11.0, 13.0, 16.5, 20.0, 20.0, 17.0, 14.0, 10.0, 10.0, 5.0, 2.0, 2.0, 2.0, 2.0, 5.0];
    const shape: box2d.b2EdgeShape = new box2d.b2EdgeShape();
    const fd: box2d.b2FixtureDef = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 10.0;
    fd.friction = 0.6;

    let x: number = startPos.x;
    let y1: number = startPos.y;
    const dx: number = 5.0;

    for (let i: number = 0; i < hs.length; ++i) {
      const y2: number = hs[i];
      shape.Set(new box2d.b2Vec2(x, y1), new box2d.b2Vec2(x + dx, y2));
      this.ground.CreateFixture(fd);
      y1 = y2;
      x += dx;
    }
    x += 20;
    shape.Set(new box2d.b2Vec2(x, 0.0), new box2d.b2Vec2(x + 40.0, 0.0));
    this.ground.CreateFixture(fd);
    return new box2d.b2Vec2(x, 0);
  }

  private createTeeter(startPos: box2d.b2Vec2) {
    const bd: box2d.b2BodyDef = new box2d.b2BodyDef();
    bd.position.Set(startPos.x, 1.0);
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    const body: box2d.b2Body = this.world.CreateBody(bd);

    const box: box2d.b2PolygonShape = new box2d.b2PolygonShape();
    box.SetAsBox(10.0, 0.25);
    body.CreateFixture(box, 1.0);

    const jd: box2d.b2RevoluteJointDef = new box2d.b2RevoluteJointDef();
    jd.Initialize(this.ground, body, body.GetPosition());
    jd.lowerAngle = -16.0 * box2d.b2_pi / 180.0;
    jd.upperAngle = 16.0 * box2d.b2_pi / 180.0;
    jd.enableLimit = true;
    this.world.CreateJoint(jd);

    body.SetAngle(-10.0);
  }
}
