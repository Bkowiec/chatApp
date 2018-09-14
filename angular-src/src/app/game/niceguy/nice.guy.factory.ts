import {INiceGuyFactory} from "./inice.guy.factory";
import {NiceGuy} from "./nice.guy";
import * as box2d from "../Box2D/Box2D";
import {NiceGuySize} from "./nice.guy.size";
import {BodyType} from "./body.type";

export class NiceGuyFactory implements INiceGuyFactory {
  private static niceGuyCounter: number = 1;
  private readonly world: box2d.b2World;

  constructor(world: box2d.b2World) {
    this.world = world;
  }

  private static createBody(world: box2d.b2World, position: box2d.b2Vec2, hx: number, hy: number, userData: any): box2d.b2Body {
    const bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(position.x, position.y);
    bd.userData = userData;
    const body = world.CreateBody(bd);

    const shape = new box2d.b2PolygonShape();
    shape.SetAsBox(hx, hy, new box2d.b2Vec2(0, 0), 0.0);
    body.CreateFixture(shape, 1.0);
    return body;
  }

  private static createCircleBody(world: box2d.b2World, position: box2d.b2Vec2, radius: number, userData: any): box2d.b2Body {
    const bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(position.x, position.y);
    bd.userData = userData;
    const body = world.CreateBody(bd);

    const circle = new box2d.b2CircleShape(radius);
    body.CreateFixture(circle, 1.0);
    return body;
  }

  private static createJoint(world: box2d.b2World, body1: box2d.b2Body, body2: box2d.b2Body, lowerAngle: number, upperAnge: number, revoluteCenter: box2d.b2Vec2): box2d.b2Joint {
    const jd = new box2d.b2RevoluteJointDef();
    jd.enableLimit = true;
    jd.lowerAngle = box2d.b2DegToRad(lowerAngle);
    jd.upperAngle = box2d.b2DegToRad(upperAnge);
    jd.Initialize(body1, body2, new box2d.b2Vec2(revoluteCenter.x, revoluteCenter.y));
    return world.CreateJoint(jd);
  }

  create(size: NiceGuySize, leftLegLowerCorner: box2d.b2Vec2): NiceGuy {
    const niceGuy: NiceGuy = new NiceGuy(this.world);
    niceGuy.id = NiceGuyFactory.niceGuyCounter++;

    this.createGuy(size, leftLegLowerCorner, niceGuy);
    return niceGuy;
  }

  private createGuy(size: NiceGuySize, leftLegLowerCorner: box2d.b2Vec2, niceGuy: NiceGuy): void {
    const lowerAngle: number = -10;
    const upperAngle: number = 10;

    const lowerArmAngle: number = -80;
    const upperArmAngle: number = 90;

    const legHx: number = 0.5 * size;
    const legHy: number = 2.0 * size;
    const leftLegPosition: box2d.b2Vec2 = new box2d.b2Vec2(leftLegLowerCorner.x + legHx, leftLegLowerCorner.y + legHy);
    niceGuy.leftLeg = NiceGuyFactory.createBody(this.world, leftLegPosition, legHx, legHy, {
      part: 'leftLeg',
      id: niceGuy.id
    });

    const torsoHx = 1.5 * size;
    const torsoHy = 2.0 * size;
    const torsoPosition = new box2d.b2Vec2(leftLegLowerCorner.x + torsoHx, leftLegLowerCorner.y + 2 * legHy + torsoHy);
    niceGuy.torso = NiceGuyFactory.createBody(this.world, torsoPosition, torsoHx, torsoHy, {
      part: 'torso',
      id: niceGuy.id
    });

    const rightLegPosition: box2d.b2Vec2 = new box2d.b2Vec2(torsoPosition.x + torsoHx - legHx, leftLegLowerCorner.y + legHy);
    niceGuy.rightLeg = NiceGuyFactory.createBody(this.world, rightLegPosition, legHx, legHy, {
      part: 'rightLeg',
      id: niceGuy.id
    });

    const headRadius: number = 1.0 * size;
    const headPosition: box2d.b2Vec2 = new box2d.b2Vec2(torsoPosition.x, torsoPosition.y + torsoHy + headRadius);
    niceGuy.head = NiceGuyFactory.createCircleBody(this.world, headPosition, headRadius, {
      part: 'head',
      id: niceGuy.id
    });

    const armHx = 1.5 * size;
    const armHy = 0.25 * size;
    const leftArmPosition = new box2d.b2Vec2(torsoPosition.x - torsoHx - armHx, torsoPosition.y + 0.4 * torsoHy);
    niceGuy.leftArm = NiceGuyFactory.createBody(this.world, leftArmPosition, armHx, armHy, {
      part: 'leftArm',
      id: niceGuy.id
    });

    const rightArmPosition = new box2d.b2Vec2(torsoPosition.x + torsoHx + armHx, torsoPosition.y + 0.4 * torsoHy);
    niceGuy.rightArm = NiceGuyFactory.createBody(this.world, rightArmPosition, armHx, armHy, {
      part: 'rightArm',
      id: niceGuy.id
    });
    // -- joints
    const leftLegJointPosition: box2d.b2Vec2 = new box2d.b2Vec2(leftLegPosition.x, torsoPosition.y - torsoHy);
    niceGuy.leftLegJoint = NiceGuyFactory.createJoint(this.world, niceGuy.leftLeg, niceGuy.torso, lowerAngle, upperAngle, leftLegJointPosition);

    const rightLegJointPosition: box2d.b2Vec2 = new box2d.b2Vec2(rightLegPosition.x, torsoPosition.y - torsoHy);
    niceGuy.rightLegJoint = NiceGuyFactory.createJoint(this.world, niceGuy.rightLeg, niceGuy.torso, lowerAngle, upperAngle, rightLegJointPosition);

    const headJointPosition: box2d.b2Vec2 = new box2d.b2Vec2(torsoPosition.x, headPosition.y - headRadius);
    niceGuy.headJoint = NiceGuyFactory.createJoint(this.world, niceGuy.head, niceGuy.torso, lowerAngle, upperAngle, headJointPosition);

    const leftArmJointPosition: box2d.b2Vec2 = new box2d.b2Vec2(torsoPosition.x - torsoHx, torsoPosition.y + 0.4 * torsoHy);
    niceGuy.leftArmJoint = NiceGuyFactory.createJoint(this.world, niceGuy.leftArm, niceGuy.torso, lowerArmAngle, upperArmAngle, leftArmJointPosition);

    const rightArmJointPosition: box2d.b2Vec2 = new box2d.b2Vec2(torsoPosition.x + torsoHx, torsoPosition.y + 0.4 * torsoHy);
    niceGuy.rightArmJoint = NiceGuyFactory.createJoint(this.world, niceGuy.rightArm, niceGuy.torso, lowerArmAngle, upperArmAngle, rightArmJointPosition);

    const impulseMultiply = 4;
    niceGuy.setBodyBreakable(niceGuy.head, niceGuy.headJoint, impulseMultiply * size * 15.0, BodyType.HEAD);
    niceGuy.setBodyBreakable(niceGuy.leftArm, niceGuy.leftArmJoint, impulseMultiply * size * 10.0, BodyType.ARM);
    niceGuy.setBodyBreakable(niceGuy.rightArm, niceGuy.rightArmJoint, impulseMultiply * size * 10.0, BodyType.ARM);
    niceGuy.setBodyBreakable(niceGuy.leftLeg, niceGuy.leftLegJoint, impulseMultiply * size * 12.0, BodyType.LEG);
    niceGuy.setBodyBreakable(niceGuy.rightLeg, niceGuy.rightLegJoint, impulseMultiply * size * 12.0, BodyType.LEG);
  }

}
