/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: import { b2Assert } from "../Common/b2Settings";
import { b2MakeArray, b2Maybe } from "../Common/b2Settings";
import { b2Vec2, b2Transform } from "../Common/b2Math";
import { b2BroadPhase } from "../Collision/b2BroadPhase";
import { b2AABB, b2RayCastInput, b2RayCastOutput } from "../Collision/b2Collision";
import { b2TreeNode } from "../Collision/b2DynamicTree";
import { b2Shape, b2ShapeType, b2MassData } from "../Collision/Shapes/b2Shape";
import { b2Body } from "./b2Body";

/// This holds contact filtering data.
export interface b2IFilter {
  /// The collision category bits. Normally you would just set one bit.
  categoryBits: number;

  /// The collision mask bits. This states the categories that this
  /// shape would accept for collision.
  maskBits: number;

  /// Collision groups allow a certain group of objects to never collide (negative)
  /// or always collide (positive). Zero means no collision group. Non-zero group
  /// filtering always wins against the mask bits.
  groupIndex?: number;
}

/// This holds contact filtering data.
export class b2Filter implements b2IFilter {
  public static readonly DEFAULT: Readonly<b2Filter> = new b2Filter();

  /// The collision category bits. Normally you would just set one bit.
  public categoryBits: number = 0x0001;

  /// The collision mask bits. This states the categories that this
  /// shape would accept for collision.
  public maskBits: number = 0xFFFF;

  /// Collision groups allow a certain group of objects to never collide (negative)
  /// or always collide (positive). Zero means no collision group. Non-zero group
  /// filtering always wins against the mask bits.
  public groupIndex: number = 0;

  public Clone(): b2Filter {
    return new b2Filter().Copy(this);
  }

  public Copy(other: b2IFilter): this {
    // DEBUG: b2Assert(this !== other);
    this.categoryBits = other.categoryBits;
    this.maskBits = other.maskBits;
    this.groupIndex = other.groupIndex || 0;
    return this;
  }
}

/// A fixture definition is used to create a fixture. This class defines an
/// abstract fixture definition. You can reuse fixture definitions safely.
export interface b2IFixtureDef {
  /// The shape, this must be set. The shape will be cloned, so you
  /// can create the shape on the stack.
  shape: b2Shape;

  /// Use this to store application specific fixture data.
  userData?: any;

  /// The friction coefficient, usually in the range [0,1].
  friction?: number;

  /// The restitution (elasticity) usually in the range [0,1].
  restitution?: number;

  /// The density, usually in kg/m^2.
  density?: number;

  /// A sensor shape collects contact information but never generates a collision
  /// response.
  isSensor?: boolean;

  /// Contact filtering data.
  filter?: b2IFilter;
}

/// A fixture definition is used to create a fixture. This class defines an
/// abstract fixture definition. You can reuse fixture definitions safely.
export class b2FixtureDef implements b2IFixtureDef {
  /// The shape, this must be set. The shape will be cloned, so you
  /// can create the shape on the stack.
  public shape: b2Shape;

  /// Use this to store application specific fixture data.
  public userData: any = null;

  /// The friction coefficient, usually in the range [0,1].
  public friction: number = 0.2;

  /// The restitution (elasticity) usually in the range [0,1].
  public restitution: number = 0;

  /// The density, usually in kg/m^2.
  public density: number = 0;

  /// A sensor shape collects contact information but never generates a collision
  /// response.
  public isSensor: boolean = false;

  /// Contact filtering data.
  public readonly filter: b2Filter = new b2Filter();
}

/// This proxy is used internally to connect fixtures to the broad-phase.
export class b2FixtureProxy {
  public readonly aabb: b2AABB = new b2AABB();
  public fixture: b2Fixture;
  public childIndex: number = 0;
  public treeNode: b2TreeNode<b2FixtureProxy>;
  constructor(fixture: b2Fixture) {
    this.fixture = fixture;
  }
}

/// A fixture is used to attach a shape to a body for collision detection. A fixture
/// inherits its transform from its parent. Fixtures hold additional non-geometric data
/// such as friction, collision filters, etc.
/// Fixtures are created via b2Body::CreateFixture.
/// @warning you cannot reuse fixtures.
export class b2Fixture {
  public m_density: number = 0;

  public m_next: b2Fixture | null = null;
  public readonly m_body: b2Body;

  public readonly m_shape: b2Shape;

  public m_friction: number = 0;
  public m_restitution: number = 0;

  public m_proxies: b2FixtureProxy[] = [];
  public m_proxyCount: number = 0;

  public readonly m_filter: b2Filter = new b2Filter();

  public m_isSensor: boolean = false;

  public m_userData: any = null;

  constructor(def: b2IFixtureDef, body: b2Body) {
    this.m_body = body;
    this.m_shape = def.shape.Clone();
  }

  /// Get the type of the child shape. You can use this to down cast to the concrete shape.
  /// @return the shape type.
  public GetType(): b2ShapeType {
    return this.m_shape.GetType();
  }

  /// Get the child shape. You can modify the child shape, however you should not change the
  /// number of vertices because this will crash some collision caching mechanisms.
  /// Manipulating the shape may lead to non-physical behavior.
  public GetShape(): b2Shape {
    return this.m_shape;
  }

  /// Set if this fixture is a sensor.
  public SetSensor(sensor: boolean): void {
    if (sensor !== this.m_isSensor) {
      this.m_body.SetAwake(true);
      this.m_isSensor = sensor;
    }
  }

  /// Is this fixture a sensor (non-solid)?
  /// @return the true if the shape is a sensor.
  public IsSensor(): boolean {
    return this.m_isSensor;
  }

  /// Set the contact filtering data. This will not update contacts until the next time
  /// step when either parent body is active and awake.
  /// This automatically calls Refilter.
  public SetFilterData(filter: b2Filter): void {
    this.m_filter.Copy(filter);

    this.Refilter();
  }

  /// Get the contact filtering data.
  public GetFilterData(): Readonly<b2Filter> {
    return this.m_filter;
  }

  /// Call this if you want to establish collision that was previously disabled by b2ContactFilter::ShouldCollide.
  public Refilter(): void {
    // Flag associated contacts for filtering.
    let edge = this.m_body.GetContactList();

    while (edge) {
      const contact = edge.contact;
      const fixtureA = contact.GetFixtureA();
      const fixtureB = contact.GetFixtureB();
      if (fixtureA === this || fixtureB === this) {
        contact.FlagForFiltering();
      }

      edge = edge.next;
    }

    const world = this.m_body.GetWorld();

    if (world === null) {
      return;
    }

    // Touch each proxy so that new pairs may be created
    const broadPhase = world.m_contactManager.m_broadPhase;
    for (let i: number = 0; i < this.m_proxyCount; ++i) {
      broadPhase.TouchProxy(this.m_proxies[i].treeNode);
    }
  }

  /// Get the parent body of this fixture. This is NULL if the fixture is not attached.
  /// @return the parent body.
  public GetBody(): b2Body {
    return this.m_body;
  }

  /// Get the next fixture in the parent body's fixture list.
  /// @return the next shape.
  public GetNext(): b2Fixture | null {
    return this.m_next;
  }

  /// Get the user data that was assigned in the fixture definition. Use this to
  /// store your application specific data.
  public GetUserData(): any {
    return this.m_userData;
  }

  /// Set the user data. Use this to store your application specific data.
  public SetUserData(data: any): void {
    this.m_userData = data;
  }

  /// Test a point for containment in this fixture.
  /// @param p a point in world coordinates.
  public TestPoint(p: b2Vec2): boolean {
    return this.m_shape.TestPoint(this.m_body.GetTransform(), p);
  }

  // #if B2_ENABLE_PARTICLE
  public ComputeDistance(p: b2Vec2, normal: b2Vec2, childIndex: number): number {
    return this.m_shape.ComputeDistance(this.m_body.GetTransform(), p, normal, childIndex);
  }
  // #endif

  /// Cast a ray against this shape.
  /// @param output the ray-cast results.
  /// @param input the ray-cast input parameters.
  public RayCast(output: b2RayCastOutput, input: b2RayCastInput, childIndex: number): boolean {
    return this.m_shape.RayCast(output, input, this.m_body.GetTransform(), childIndex);
  }

  /// Get the mass data for this fixture. The mass data is based on the density and
  /// the shape. The rotational inertia is about the shape's origin. This operation
  /// may be expensive.
  public GetMassData(massData: b2MassData = new b2MassData()): b2MassData {
    this.m_shape.ComputeMass(massData, this.m_density);

    return massData;
  }

  /// Set the density of this fixture. This will _not_ automatically adjust the mass
  /// of the body. You must call b2Body::ResetMassData to update the body's mass.
  public SetDensity(density: number): void {
    this.m_density = density;
  }

  /// Get the density of this fixture.
  public GetDensity(): number {
    return this.m_density;
  }

  /// Get the coefficient of friction.
  public GetFriction(): number {
    return this.m_friction;
  }

  /// Set the coefficient of friction. This will _not_ change the friction of
  /// existing contacts.
  public SetFriction(friction: number): void {
    this.m_friction = friction;
  }

  /// Get the coefficient of restitution.
  public GetRestitution(): number {
    return this.m_restitution;
  }

  /// Set the coefficient of restitution. This will _not_ change the restitution of
  /// existing contacts.
  public SetRestitution(restitution: number): void {
    this.m_restitution = restitution;
  }

  /// Get the fixture's AABB. This AABB may be enlarge and/or stale.
  /// If you need a more accurate AABB, compute it using the shape and
  /// the body transform.
  public GetAABB(childIndex: number): Readonly<b2AABB> {
    // DEBUG: b2Assert(0 <= childIndex && childIndex < this.m_proxyCount);
    return this.m_proxies[childIndex].aabb;
  }

  /// Dump this fixture to the log file.
  public Dump(log: (format: string, ...args: any[]) => void, bodyIndex: number): void {
    log("    const fd: b2FixtureDef = new b2FixtureDef();\n");
    log("    fd.friction = %.15f;\n", this.m_friction);
    log("    fd.restitution = %.15f;\n", this.m_restitution);
    log("    fd.density = %.15f;\n", this.m_density);
    log("    fd.isSensor = %s;\n", (this.m_isSensor) ? ("true") : ("false"));
    log("    fd.filter.categoryBits = %d;\n", this.m_filter.categoryBits);
    log("    fd.filter.maskBits = %d;\n", this.m_filter.maskBits);
    log("    fd.filter.groupIndex = %d;\n", this.m_filter.groupIndex);

    this.m_shape.Dump(log);

    log("\n");
    log("    fd.shape = shape;\n");
    log("\n");
    log("    bodies[%d].CreateFixture(fd);\n", bodyIndex);
  }

  // We need separation create/destroy functions from the constructor/destructor because
  // the destructor cannot access the allocator (no destructor arguments allowed by C++).
  public Create(def: b2IFixtureDef): void {
    this.m_userData = def.userData;
    this.m_friction = b2Maybe(def.friction,  0.2);
    this.m_restitution = b2Maybe(def.restitution, 0);

    // this.m_body = body;
    this.m_next = null;

    this.m_filter.Copy(b2Maybe(def.filter, b2Filter.DEFAULT));

    this.m_isSensor = b2Maybe(def.isSensor, false);

    // Reserve proxy space
    // const childCount = m_shape->GetChildCount();
    // m_proxies = (b2FixtureProxy*)allocator->Allocate(childCount * sizeof(b2FixtureProxy));
    // for (int32 i = 0; i < childCount; ++i)
    // {
    //   m_proxies[i].fixture = NULL;
    //   m_proxies[i].proxyId = b2BroadPhase::e_nullProxy;
    // }
    // this.m_proxies = b2FixtureProxy.MakeArray(this.m_shape.GetChildCount());
    this.m_proxies = b2MakeArray(this.m_shape.GetChildCount(), (i) => new b2FixtureProxy(this));
    this.m_proxyCount = 0;

    this.m_density = b2Maybe(def.density, 0);
  }

  public Destroy(): void {
    // The proxies must be destroyed before calling this.
    // DEBUG: b2Assert(this.m_proxyCount === 0);

    // Free the proxy array.
    // int32 childCount = m_shape->GetChildCount();
    // allocator->Free(m_proxies, childCount * sizeof(b2FixtureProxy));
    // m_proxies = NULL;

    // this.m_shape = null;
  }

  // These support body activation/deactivation.
  public CreateProxies(xf: b2Transform): void {
    const broadPhase: b2BroadPhase<b2FixtureProxy> = this.m_body.m_world.m_contactManager.m_broadPhase;
    // DEBUG: b2Assert(this.m_proxyCount === 0);

    // Create proxies in the broad-phase.
    this.m_proxyCount = this.m_shape.GetChildCount();

    for (let i: number = 0; i < this.m_proxyCount; ++i) {
      const proxy = this.m_proxies[i] = new b2FixtureProxy(this);
      this.m_shape.ComputeAABB(proxy.aabb, xf, i);
      proxy.treeNode = broadPhase.CreateProxy(proxy.aabb, proxy);
      proxy.childIndex = i;
    }
  }

  public DestroyProxies(): void {
    const broadPhase: b2BroadPhase<b2FixtureProxy> = this.m_body.m_world.m_contactManager.m_broadPhase;
    // Destroy proxies in the broad-phase.
    for (let i: number = 0; i < this.m_proxyCount; ++i) {
      const proxy = this.m_proxies[i];
      delete proxy.treeNode.userData;
      broadPhase.DestroyProxy(proxy.treeNode);
      delete proxy.treeNode;
    }

    this.m_proxyCount = 0;
  }

  public TouchProxies(): void {
    const broadPhase: b2BroadPhase<b2FixtureProxy> = this.m_body.m_world.m_contactManager.m_broadPhase;
    const proxyCount: number = this.m_proxyCount;
    for (let i: number = 0; i < proxyCount; ++i) {
      broadPhase.TouchProxy(this.m_proxies[i].treeNode);
    }
  }

  private static Synchronize_s_aabb1 = new b2AABB();
  private static Synchronize_s_aabb2 = new b2AABB();
  private static Synchronize_s_displacement = new b2Vec2();
  public Synchronize(transform1: b2Transform, transform2: b2Transform): void {
    if (this.m_proxyCount === 0) {
      return;
    }

    const broadPhase: b2BroadPhase<b2FixtureProxy> = this.m_body.m_world.m_contactManager.m_broadPhase;

    for (let i: number = 0; i < this.m_proxyCount; ++i) {
      const proxy = this.m_proxies[i];

      // Compute an AABB that covers the swept shape (may miss some rotation effect).
      const aabb1 = b2Fixture.Synchronize_s_aabb1;
      const aabb2 = b2Fixture.Synchronize_s_aabb2;
      this.m_shape.ComputeAABB(aabb1, transform1, i);
      this.m_shape.ComputeAABB(aabb2, transform2, i);

      proxy.aabb.Combine2(aabb1, aabb2);

      const displacement: b2Vec2 = b2Vec2.SubVV(transform2.p, transform1.p, b2Fixture.Synchronize_s_displacement);

      broadPhase.MoveProxy(proxy.treeNode, proxy.aabb, displacement);
    }
  }
}
