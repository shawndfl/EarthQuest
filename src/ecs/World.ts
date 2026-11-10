export type Entity = number;
export type ComponentType<T> = abstract new (...args: never[]) => T;

export interface System {
  update(world: World, deltaSeconds: number): void;
}

/**
 * Manages the wold for a scene. This includes all the systems and components for the scene.
 */
export class World {
  private nextEntity = 1;
  private readonly entities = new Set<Entity>();
  private readonly components = new Map<ComponentType<unknown>, Map<Entity, unknown>>();
  private readonly systems: System[] = [];

  createEntity(): Entity {
    const entity = this.nextEntity++;
    this.entities.add(entity);
    return entity;
  }

  destroyEntity(entity: Entity): void {
    this.entities.delete(entity);
    for (const store of this.components.values()) store.delete(entity);
  }

  addComponent<T extends object>(entity: Entity, component: T): T {
    if (!this.entities.has(entity)) throw new Error(`Entity ${entity} does not exist`);
    const type = component.constructor as ComponentType<T>;
    let store = this.components.get(type) as Map<Entity, T> | undefined;
    if (!store) {
      store = new Map<Entity, T>();
      this.components.set(type, store as Map<Entity, unknown>);
    }
    store.set(entity, component);
    return component;
  }

  getComponent<T>(entity: Entity, type: ComponentType<T>): T | undefined {
    return this.components.get(type)?.get(entity) as T | undefined;
  }

  removeComponent<T>(entity: Entity, type: ComponentType<T>): boolean {
    return this.components.get(type)?.delete(entity) ?? false;
  }

  query<T extends readonly ComponentType<unknown>[]>(
    ...types: T
  ): Array<[Entity, ...{ [K in keyof T]: T[K] extends ComponentType<infer C> ? C : never }]> {
    if (types.length === 0) 
      return [];

    const first = this.components.get(types[0]);
    if (!first) 
      return [];

    const matches: Array<[Entity, ...unknown[]]> = [];

    for (const entity of first.keys()) {
      const values = types.map(type => this.components.get(type)?.get(entity));
      if (values.every(value => value !== undefined)) matches.push([entity, ...values]);
    }

    return matches as unknown as Array<[
      Entity,
      ...{ [K in keyof T]: T[K] extends ComponentType<infer C> ? C : never },
    ]>;
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  update(deltaSeconds: number): void {
    for (const system of this.systems){
       system.update(this, deltaSeconds);
    }
  }
}
