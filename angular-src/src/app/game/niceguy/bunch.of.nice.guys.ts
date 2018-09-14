import * as box2d from "../Box2D/Box2D";
import {INiceGuyFactory} from "./inice.guy.factory";
import {NiceGuySize} from "./nice.guy.size";
import {NiceGuy} from "./nice.guy";
import {BodyType} from "./body.type";

export class BunchOfNiceGuys {
  private niceGuys: NiceGuy[] = [];
  private attackedNiceGuys: { id: number, isDead: boolean, impulse: number, bodyType: BodyType }[];

  constructor(
    private niceGuyFactory: INiceGuyFactory
  ) {
  }

  create(size: NiceGuySize, x: number, y: number) {
    const niceGuy = this.niceGuyFactory.create(size, new box2d.b2Vec2(x, y));
    this.niceGuys.push(niceGuy);
  }

  postSolve(contact: box2d.b2Contact, impulse: box2d.b2ContactImpulse): {id: number, isDead: boolean, impulse: number, bodyType: BodyType}[] {
    const attackedNiceGuys: {id: number, isDead: boolean, impulse: number, bodyType: BodyType}[] = [];
    this.niceGuys.forEach(niceGuy => {
      const brokenBody: { impulse: number, bodyType: BodyType } = niceGuy.destroyJointWhenBodyHitOverMaxImpulse(contact, impulse);
      const isNiceGuyDown = niceGuy.isDown();
      if (brokenBody !== null) {
        // console.log(brokenBody);
        attackedNiceGuys.push({id: niceGuy.id, isDead: niceGuy.isDead(), impulse: brokenBody.impulse, bodyType: brokenBody.bodyType});
      } else if (isNiceGuyDown) {
        // console.log('nice guy fallen down');
        attackedNiceGuys.push({id: niceGuy.id, isDead: true, impulse: 0, bodyType: BodyType.HEAD});
      }
    });
    this.attackedNiceGuys = attackedNiceGuys;
    return attackedNiceGuys;
  }

  updateBodiesState() {
    this.niceGuys.forEach(niceGuy => niceGuy.updateBodiesState());
    this.attackedNiceGuys.filter(attackedNiceGuy => attackedNiceGuy.isDead)
      .forEach(deadNiceGuy => {
        const index = this.niceGuys.findIndex(niceGuy => niceGuy.id === deadNiceGuy.id);
        if (index !== -1) {
          this.niceGuys.splice(index, 1);
        }
    });
  }
}
