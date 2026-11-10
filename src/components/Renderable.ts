import type { Object3D } from 'three';

export class Renderable {
  constructor(public readonly object: Object3D) {}
}
