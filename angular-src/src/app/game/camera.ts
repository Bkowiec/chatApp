import * as box2d from "./Box2D/Box2D";
import {Injectable} from "@angular/core";
//
@Injectable()
export class Camera {
  public readonly m_center: box2d.b2Vec2 = new box2d.b2Vec2(0, 20);
  ///public readonly m_roll: box2d.b2Rot = new box2d.b2Rot(box2d.b2DegToRad(0));
  public m_extent: number = 25;
  public m_zoom: number = 1;
  public m_width: number = 1280;
  public m_height: number = 800;

  public ConvertScreenToWorld(screenPoint: box2d.b2Vec2, out: box2d.b2Vec2): box2d.b2Vec2 {
    return this.ConvertElementToWorld(screenPoint, out);
  }

  public ConvertWorldToScreen(worldPoint: box2d.b2Vec2, out: box2d.b2Vec2): box2d.b2Vec2 {
    return this.ConvertWorldToElement(worldPoint, out);
  }

  public HomeCamera(): void {
    this.m_center.Set(0, 20 * this.m_zoom);
    ///g_camera.m_roll.SetAngle(box2d.b2DegToRad(0));
  }

  public MoveCamera(move: box2d.b2Vec2): void {
    const position: box2d.b2Vec2 = this.m_center.Clone();
    ///move.SelfRotate(g_camera.m_roll.GetAngle());
    position.SelfAdd(move);
    this.m_center.Copy(position);
  }

  public ConvertViewportToElement(viewport: box2d.b2Vec2, out: box2d.b2Vec2): box2d.b2Vec2 {
    // 0,0 at center of canvas, x right and y up
    const element_x: number = viewport.x + (0.5 * this.m_width);
    const element_y: number = (0.5 * this.m_height) - viewport.y;
    return out.Set(element_x, element_y);
  }

  public ConvertElementToViewport(element: box2d.b2Vec2, out: box2d.b2Vec2): box2d.b2Vec2 {
    // 0,0 at center of canvas, x right and y up
    const viewport_x: number = element.x - (0.5 * this.m_width);
    const viewport_y: number = (0.5 * this.m_height) - element.y;
    return out.Set(viewport_x, viewport_y);
  }

  public ConvertProjectionToViewport(projection: box2d.b2Vec2, out: box2d.b2Vec2): box2d.b2Vec2 {
    const viewport: box2d.b2Vec2 = out.Copy(projection);
    box2d.b2Vec2.MulSV(1 / this.m_zoom, viewport, viewport);
    ///box2d.b2Vec2.MulSV(this.m_extent, viewport, viewport);
    box2d.b2Vec2.MulSV(0.5 * this.m_height / this.m_extent, projection, projection);
    return viewport;
  }

  public ConvertViewportToProjection(viewport: box2d.b2Vec2, out: box2d.b2Vec2): box2d.b2Vec2 {
    const projection: box2d.b2Vec2 = out.Copy(viewport);
    ///box2d.b2Vec2.MulSV(1 / this.m_extent, projection, projection);
    box2d.b2Vec2.MulSV(2 * this.m_extent / this.m_height, projection, projection);
    box2d.b2Vec2.MulSV(this.m_zoom, projection, projection);
    return projection;
  }

  public ConvertWorldToProjection(world: box2d.b2Vec2, out: box2d.b2Vec2): box2d.b2Vec2 {
    const projection: box2d.b2Vec2 = out.Copy(world);
    box2d.b2Vec2.SubVV(projection, this.m_center, projection);
    ///box2d.b2Rot.MulTRV(this.m_roll, projection, projection);
    return projection;
  }

  public ConvertProjectionToWorld(projection: box2d.b2Vec2, out: box2d.b2Vec2): box2d.b2Vec2 {
    const world: box2d.b2Vec2 = out.Copy(projection);
    ///box2d.b2Rot.MulRV(this.m_roll, world, world);
    box2d.b2Vec2.AddVV(this.m_center, world, world);
    return world;
  }

  public ConvertElementToWorld(element: box2d.b2Vec2, out: box2d.b2Vec2): box2d.b2Vec2 {
    const viewport: box2d.b2Vec2 = this.ConvertElementToViewport(element, out);
    const projection: box2d.b2Vec2 = this.ConvertViewportToProjection(viewport, out);
    return this.ConvertProjectionToWorld(projection, out);
  }

  public ConvertWorldToElement(world: box2d.b2Vec2, out: box2d.b2Vec2): box2d.b2Vec2 {
    const projection: box2d.b2Vec2 = this.ConvertWorldToProjection(world, out);
    const viewport: box2d.b2Vec2 = this.ConvertProjectionToViewport(projection, out);
    return this.ConvertViewportToElement(viewport, out);
  }

  public ConvertElementToProjection(element: box2d.b2Vec2, out: box2d.b2Vec2): box2d.b2Vec2 {
    const viewport: box2d.b2Vec2 = this.ConvertElementToViewport(element, out);
    return this.ConvertViewportToProjection(viewport, out);
  }
}
