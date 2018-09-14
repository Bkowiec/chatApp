import * as box2d from "./../Box2D/Box2D";
import {BodyType} from "./body.type";

export class NiceGuy {
  public leftLeg: box2d.b2Body;
  public rightLeg: box2d.b2Body;
  public leftArm: box2d.b2Body;
  public rightArm: box2d.b2Body;
  public torso: box2d.b2Body;
  public head: box2d.b2Body;
  public headJoint: box2d.b2Joint;
  public leftArmJoint: box2d.b2Joint;
  public rightArmJoint: box2d.b2Joint;
  public leftLegJoint: box2d.b2Joint;
  public rightLegJoint: box2d.b2Joint;
  public id: number;
  private world: box2d.b2World;
  private breakableBodies: { body: box2d.b2Body, joint: box2d.b2Joint, maxImpulse: number, broken: boolean, bodyType: BodyType }[] = [];

  constructor(world: box2d.b2World) {
    this.world = world;
  }

  public destroyJointWhenBodyHitOverMaxImpulse(contact: box2d.b2Contact, impulse: box2d.b2ContactImpulse): { impulse: number, bodyType: BodyType } {
    const contactA: box2d.b2Body = contact.GetFixtureA().GetBody();
    const contactB: box2d.b2Body = contact.GetFixtureB().GetBody();

    for (let i: number = 0; i < this.breakableBodies.length; ++i) {
      const breakableBody = this.breakableBodies[i];
      if (breakableBody.broken) {
        continue;
      }
      if (this.isBodyInContact(breakableBody.body, contactA, contactB)) {
        const count = contact.GetManifold().pointCount;

        let maxImpulse = 0.0;
        for (let i = 0; i < count; ++i) {
          maxImpulse = box2d.b2Max(maxImpulse, impulse.normalImpulses[i]);
        }
        if (breakableBody.maxImpulse < maxImpulse) {
          breakableBody.broken = true;
          return {impulse: maxImpulse, bodyType: breakableBody.bodyType};
        }
      }
    }
    return null;
  }

  setBodyBreakable(body: box2d.b2Body, joint: box2d.b2Joint, maxImpulse: number, bodyType: BodyType) {
    this.breakableBodies.push({body: body, joint: joint, maxImpulse: maxImpulse, broken: false, bodyType});
  }

  updateBodiesState(): void {
    const brokenBodies = this.breakableBodies.filter(breakableBody => breakableBody.broken);

    if (brokenBodies == undefined || brokenBodies.length === 0) {
      return;
    }
    brokenBodies.forEach(breakableBody => {
      this.world.DestroyJoint(breakableBody.joint);
      breakableBody.broken = true;
    });

    this.breakableBodies = this.breakableBodies.filter(breakableBody => !breakableBody.broken);
  }

  isDead(): boolean {
    if (this.breakableBodies.length < 3) {
      console.log('not enough bodies');
      return true;
    }
    const brokenBodies = this.breakableBodies.filter(breakableBody => breakableBody.broken);
    if (brokenBodies.length > 2) {
      console.log('too many broken bodies: ' + brokenBodies.length);
      return true;
    }
    const headIndex = this.breakableBodies.findIndex(breakableBody => breakableBody.bodyType === BodyType.HEAD && breakableBody.broken);
    if (headIndex !== -1) {
      console.log('head off');
      return true;
    }
    return false;
  }

  isDown() {
    const isBodyOverGameLevelIndex = this.breakableBodies.findIndex(breakableBody => breakableBody.body.GetPosition().y > -3);
    if (isBodyOverGameLevelIndex === -1) {
      console.log('nice guy down');
      return true;
    }
    return false;
  }

  private isBodyInContact(body: box2d.b2Body, contactA: box2d.b2Body, contactB: box2d.b2Body): boolean {
    if (contactA.GetUserData() !== null) {
      if ((contactA.GetUserData().id === body.GetUserData().id) && (contactA.GetUserData().type === body.GetUserData().type)) {
        return true;
      }
    }
    if (contactB.GetUserData() !== null) {
      if ((contactB.GetUserData().id === body.GetUserData().id) && (contactB.GetUserData().type === body.GetUserData().type)) {
        return true;
      }
    }
    return false;
  }
}
