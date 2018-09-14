import {NiceGuy} from "./nice.guy";
import {NiceGuySize} from "./nice.guy.size";
import * as box2d from "./../Box2D/Box2D";

export interface INiceGuyFactory {

  create(size: NiceGuySize, leftLegLowerCorner: box2d.b2Vec2): NiceGuy;
}

