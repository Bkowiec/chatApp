import * as box2d from "./Box2D/Box2D";
import {Injectable} from "@angular/core";
import {Camera} from "./camera";
import {GameSettings} from "./game.settings";

@Injectable()
export class ShapeDrawer extends box2d.b2Draw {
  public ctx: CanvasRenderingContext2D | null = null;

  constructor(private camera: Camera) {
    super();
  }

  DrawCircle(center: box2d.XY, radius: number, color: box2d.b2Color): void {
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y, radius, 0, box2d.b2_pi * 2, true);
      this.ctx.strokeStyle = color.MakeStyleString(1);
      this.ctx.stroke();
    }
  }

  DrawParticles(centers: box2d.XY[], radius: number, colors: box2d.b2Color[] | null, count: number): void {
    if (this.ctx) {
      if (colors !== null) {
        for (let i = 0; i < count; ++i) {
          const center = centers[i];
          const color = colors[i];
          this.ctx.fillStyle = color.MakeStyleString();
          // this.ctx.fillRect(center.x - radius, center.y - radius, 2 * radius, 2 * radius);
          // this.ctx.beginPath(); this.ctx.arc(center.x, center.y, radius, 0, box2d.b2_pi * 2, true); this.ctx.fill();
        }
      } else {
        this.ctx.fillStyle = "b2Color(255,255,255,0.5)";
        //  this.ctx.beginPath();
        for (let i = 0; i < count; ++i) {
          const center = centers[i];
          //    this.ctx.rect(center.x - radius, center.y - radius, 2 * radius, 2 * radius);
          this.ctx.beginPath();
          this.ctx.arc(center.x, center.y, radius, 0, box2d.b2_pi * 2, true);
          this.ctx.fill();
        }
        //  this.ctx.fill();
      }
    }
  }

  DrawPoint(p: box2d.XY, size: number, color: box2d.b2Color): void {
    if (this.ctx) {
      this.ctx.fillStyle = color.MakeStyleString();
      size *= this.camera.m_zoom;
      size /= this.camera.m_extent;
      const hsize: number = size / 2;
      this.ctx.fillRect(p.x - hsize, p.y - hsize, size, size);
    }
  }

  DrawPolygon(vertices: box2d.XY[], vertexCount: number, color: box2d.b2Color): void {
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let i: number = 1; i < vertexCount; i++) {
        this.ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      this.ctx.closePath();
      this.ctx.strokeStyle = color.MakeStyleString(1);
      this.ctx.stroke();
    }
  }

  DrawSegment(p1: box2d.XY, p2: box2d.XY, color: box2d.b2Color): void {
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.strokeStyle = color.MakeStyleString(1);
      this.ctx.stroke();
    }
  }

  DrawSolidCircle(center: box2d.XY, radius: number, axis: box2d.XY, color: box2d.b2Color): void {
    if (this.ctx) {
      const cx: number = center.x;
      const cy: number = center.y;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, 0, box2d.b2_pi * 2, true);
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo((cx + axis.x * radius), (cy + axis.y * radius));
      this.ctx.fillStyle = color.MakeStyleString(0.5);
      this.ctx.fill();
      this.ctx.strokeStyle = color.MakeStyleString(1);
      this.ctx.stroke();
    }
  }

  DrawSolidPolygon(vertices: box2d.XY[], vertexCount: number, color: box2d.b2Color): void {
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let i: number = 1; i < vertexCount; i++) {
        this.ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      this.ctx.closePath();
      this.ctx.fillStyle = color.MakeStyleString(0.5);
      this.ctx.fill();
      this.ctx.strokeStyle = color.MakeStyleString(1);
      this.ctx.stroke();
    }
  }

  DrawTransform(xf: box2d.b2Transform): void {
    if (this.ctx) {
      this.PushTransform(xf);

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(1, 0);
      this.ctx.strokeStyle = box2d.b2Color.RED.MakeStyleString(1);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(0, 1);
      this.ctx.strokeStyle = box2d.b2Color.GREEN.MakeStyleString(1);
      this.ctx.stroke();

      this.PopTransform(xf);
    }
  }

  PopTransform(xf: box2d.b2Transform): void {
    if (this.ctx) {
      this.ctx.restore();
    }
  }

  PushTransform(xf: box2d.b2Transform): void {
    if (this.ctx) {
      this.ctx.save();
      this.ctx.translate(xf.p.x, xf.p.y);
      this.ctx.rotate(xf.q.GetAngle());
    }
  }

  setDrawerFlags(settings: GameSettings) {
    let flags = box2d.b2DrawFlags.e_none;
    if (settings.drawShapes) { flags |= box2d.b2DrawFlags.e_shapeBit;        }
    // #if B2_ENABLE_PARTICLE
    if (settings.drawParticles) { flags |= box2d.b2DrawFlags.e_particleBit; }
    // #endif
    if (settings.drawJoints) { flags |= box2d.b2DrawFlags.e_jointBit;        }
    if (settings.drawAABBs ) { flags |= box2d.b2DrawFlags.e_aabbBit;         }
    if (settings.drawCOMs  ) { flags |= box2d.b2DrawFlags.e_centerOfMassBit; }
    if (settings.drawControllers  ) { flags |= box2d.b2DrawFlags.e_controllerBit; }
    this.SetFlags(flags);
  }

}
