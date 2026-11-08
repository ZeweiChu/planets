import * as THREE from 'three';
import { EYE_HEIGHT, START, SITES, WALK_LIMIT, canStand, heightAt, movePlayer, noise, random, type Obstacle, type Point } from './world';

export type Quality = 'high' | 'low';
export type SceneState = { x: number; z: number; yaw: number; distance: number; nearest: number; boundary: boolean };
type Options = { quality: Quality; onUpdate: (state: SceneState) => void; onError: () => void };

export class MarsScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(62, 1, .08, 1800);
  private terrain!: THREE.Mesh;
  private sun!: THREE.DirectionalLight;
  private targetRing!: THREE.Mesh;
  private obstacles: Obstacle[] = [];
  private abort = new AbortController();
  private keys = new Set<string>();
  private position: Point = { x: START.x, z: START.z };
  private yaw: number = START.yaw;
  private pitch: number = START.pitch;
  private target: Point | null = null;
  private drag: { id: number; x: number; y: number; startX: number; startY: number; moved: boolean } | null = null;
  private raycaster = new THREE.Raycaster();
  private distance = 0;
  private active = false;
  private disposed = false;
  private previous = 0;
  private lastReport = 0;
  private frame = 0;
  private needsRender = true;
  private quality: Quality;
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private canvas: HTMLCanvasElement, private options: Options) {
    this.quality = options.quality;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    try {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = .95;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      // Lights and terrain are static: cache shadows instead of redrawing them on every step.
      this.renderer.shadowMap.autoUpdate = false;
      this.renderer.shadowMap.needsUpdate = true;
      this.scene.fog = new THREE.FogExp2('#b89c80', .0045);
      this.camera.rotation.order = 'YXZ';
      this.buildWorld();
      this.setQuality(options.quality);
      this.bindControls();
      this.resize();
      this.setCamera();
      this.renderer.render(this.scene, this.camera);
      this.needsRender = false;
      this.frame = requestAnimationFrame(this.tick);
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  private groundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const img = ctx.createImageData(512, 512);
    const rng = random(138);
    for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
      const n = noise(x / 22, y / 22) * .45 + noise(x / 5, y / 5) * .2 + rng() * .35;
      const ripple = Math.sin(y * .11 + Math.sin(x * .02) * 2) * 5;
      const v = Math.min(255, Math.max(0, 130 + n * 100 + ripple));
      const i = (y * 512 + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(85, 85);
    texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  private buildWorld() {
    this.scene.add(new THREE.HemisphereLight('#e1ceb2', '#554133', 2.1));
    this.sun = new THREE.DirectionalLight('#ffe0b1', 3.2);
    this.sun.position.set(-100, 74, -130);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, { left: -65, right: 65, top: 65, bottom: -65, near: 1, far: 350 });
    this.sun.shadow.bias = -.0002;
    this.sun.shadow.normalBias = .025;
    this.scene.add(this.sun, this.sun.target);

    const sky = new THREE.Mesh(new THREE.SphereGeometry(1300, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 direction; void main(){ direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `varying vec3 direction;
        void main(){
          vec3 d=normalize(direction);
          vec3 horizon=vec3(.66,.48,.33), zenith=vec3(.25,.24,.235);
          vec3 color=mix(horizon,zenith,pow(max(d.y,0.),.44));
          vec3 sun=normalize(vec3(-100.,74.,-130.));
          float facing=max(dot(d,sun),0.);
          color+=vec3(.33,.24,.16)*pow(facing,22.);
          color+=vec3(1.6,1.42,1.13)*smoothstep(.99991,.99997,facing);
          gl_FragColor=vec4(color,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    this.scene.add(sky);

    const groundGeometry = (size: number, segments: number, outer = false) => {
      const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
      geometry.rotateX(-Math.PI / 2);
      const vertices = geometry.attributes.position;
      const colors = new Float32Array(vertices.count * 3);
      const sand = new THREE.Color('#b38c6a'), dark = new THREE.Color('#90654e');
      for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i), z = vertices.getZ(i);
        let h = heightAt(x, z);
        if (!outer) {
          // Match the coarse outer grid at the seam, beyond the walkable boundary.
          const blend = THREE.MathUtils.smoothstep(Math.max(Math.abs(x), Math.abs(z)), 48, 52);
          const x0 = Math.floor(x / 4) * 4, z0 = Math.floor(z / 4) * 4;
          const a = (x - x0) / 4, b = (z - z0) / 4;
          const coarse = THREE.MathUtils.lerp(
            THREE.MathUtils.lerp(heightAt(x0, z0), heightAt(x0 + 4, z0), a),
            THREE.MathUtils.lerp(heightAt(x0, z0 + 4), heightAt(x0 + 4, z0 + 4), a), b);
          h = THREE.MathUtils.lerp(h, coarse, blend);
        }
        vertices.setY(i, h);
        const n = noise(x * .075, z * .075) * .65 + noise(x * .7, z * .7) * .35;
        const c = dark.clone().lerp(sand, n);
        colors.set([c.r, c.g, c.b], i * 3);
        // One world-space texture scale for both meshes.
        geometry.attributes.uv.setXY(i, (x + 220) / 440, (z + 220) / 440);
      }
      if (outer) {
        const original = geometry.index!, indices: number[] = [];
        for (let i = 0; i < original.count; i += 3) {
          const a = original.getX(i), b = original.getX(i + 1), c = original.getX(i + 2);
          const x = (vertices.getX(a) + vertices.getX(b) + vertices.getX(c)) / 3;
          const z = (vertices.getZ(a) + vertices.getZ(b) + vertices.getZ(c)) / 3;
          if (Math.abs(x) >= 52 || Math.abs(z) >= 52) indices.push(a, b, c);
        }
        geometry.setIndex(indices);
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.computeVertexNormals();
      return geometry;
    };
    const texture = this.groundTexture();
    const groundMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 1, map: texture, bumpMap: texture, bumpScale: .12,
    });
    groundMaterial.onBeforeCompile = shader => {
      shader.vertexShader = 'varying vec3 groundPosition;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ngroundPosition=position;');
      shader.fragmentShader = 'varying vec3 groundPosition;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        vec2 duneOffset=groundPosition.xz-vec2(18.,-10.);
        float duneMask=exp(-dot(duneOffset,duneOffset)/90.);
        float ripple=sin(groundPosition.x*5.+groundPosition.z*.9+sin(groundPosition.z*.65));
        float sandHeight=ripple*.045*duneMask;
        normal=perturbNormalArb(-vViewPosition,normal,vec2(dFdx(sandHeight),dFdy(sandHeight)),faceDirection);
        diffuseColor.rgb*=1.+duneMask*.08*ripple;
      `);
    };
    const outerGround = new THREE.Mesh(groundGeometry(440, 110, true), groundMaterial);
    outerGround.receiveShadow = true;
    this.scene.add(outerGround);
    this.terrain = new THREE.Mesh(groundGeometry(104, 260), groundMaterial);
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);
    this.buildRidges();
    this.buildRocks();
    this.buildOutcrop();


    const ring = new THREE.Mesh(new THREE.RingGeometry(.23, .29, 40), new THREE.MeshBasicMaterial({ color: '#f4dfbd', transparent: true, opacity: .8, depthWrite: false, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    ring.visible = false;
    this.targetRing = ring;
    this.scene.add(ring);
  }

  private buildRidges() {
    // Closed radial hills have a foreground slope as well as a distant silhouette.
    for (let layer = 0; layer < 3; layer++) {
      const radius = [105, 310, 570][layer];
      const count = 360, rows = 24, width = [220, 310, 400][layer];
      const positions: number[] = [], colors: number[] = [], indices: number[] = [];
      const color = new THREE.Color(['#9b7a60', '#a3836b', '#b3977d'][layer]);
      for (let i = 0; i <= count; i++) {
        const angle = i / count * Math.PI * 2;
        const n = noise(Math.cos(angle) * 5 + layer * 16, Math.sin(angle) * 5);
        const high = [10, 25, 45][layer] + n * [28, 65, 90][layer];
        for (let row = 0; row <= rows; row++) {
          const t = row / rows;
          const r = radius + t * width;
          const x = Math.sin(angle) * r, z = Math.cos(angle) * r;
          const erosion = noise(x * .055, z * .055) * 4 + noise(x * .13, z * .13) * 1.4;
          const profile = Math.pow(Math.sin(t * Math.PI), 1.6);
          positions.push(x, profile * (high + erosion) - 3, z);
          const shade = .76 + noise(x * .035, z * .035) * .32;
          colors.push(color.r * shade, color.g * shade, color.b * shade);
          if (i < count && row < rows) {
            const a = i * (rows + 1) + row;
            indices.push(a, a + 1, a + rows + 1, a + 1, a + rows + 2, a + rows + 1);
          }
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.setIndex(indices); geo.computeVertexNormals();
      this.scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide })));
    }
  }

  private rockGeometry(seed: number) {
    const geo = new THREE.IcosahedronGeometry(1, 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const n = .8 + noise(x * 3 + seed, z * 3 + y * 4) * .35;
      pos.setXYZ(i, x * n, y * n * .65 + Math.sin(x * 5 + seed) * .04, z * n);
    }
    geo.computeVertexNormals();
    return geo;
  }

  private rockMaterial(color: string) {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true });
    // World-space mineral variation avoids seams and identical-looking instances.
    material.onBeforeCompile = shader => {
      shader.vertexShader = 'varying vec3 rockPosition;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nrockPosition=position;');
      shader.fragmentShader = 'varying vec3 rockPosition;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        float grain=fract(sin(dot(floor(rockPosition*180.),vec3(12.9898,78.233,39.425)))*43758.5453);
        float layer=sin(rockPosition.y*68.+sin(rockPosition.x*5.)*.9);
        diffuseColor.rgb*=.86+grain*.2+layer*.055;`);
    };
    return material;
  }

  private buildRocks() {
    const rng = random(7641);
    const matrix = new THREE.Object3D();
    for (let group = 0; group < 4; group++) {
      const count = group === 0 ? 60 : 340;
      const mesh = new THREE.InstancedMesh(this.rockGeometry(group * 13), this.rockMaterial(['#85715c', '#907359', '#a68765', '#715e4e'][group]), count);
      for (let i = 0; i < count; i++) {
        let x = (rng() - .5) * 240, z = (rng() - .5) * 240;
        if (group === 0 && i < 25) { x = (rng() - .5) * 75; z = (rng() - .5) * 75; }
        const scale = group === 0 ? .65 + rng() * 1.45 : .06 + rng() * .38;
        // Keep landing, discovery approaches and the sand field navigable.
        if (Math.hypot(x - START.x, z - START.z) < 5 || SITES.some(s => Math.hypot(x - s.visit.x, z - s.visit.z) < 4) || Math.hypot(x - 18, z + 10) < 8) { x += 65; }
        matrix.position.set(x, heightAt(x, z) + scale * .17, z);
        matrix.rotation.set(rng() * .4, rng() * Math.PI * 2, rng() * .3);
        matrix.scale.set(scale * (1 + rng() * .5), scale, scale * (.7 + rng() * .45));
        matrix.updateMatrix(); mesh.setMatrixAt(i, matrix.matrix);
        mesh.setColorAt(i, new THREE.Color().setScalar(.8 + rng() * .4));
        if (scale > .7 && Math.abs(x) < 42 && Math.abs(z) < 42) this.obstacles.push({ x, z, radius: scale * 1.2 });
      }
      mesh.castShadow = true; mesh.receiveShadow = true;
      this.scene.add(mesh);
    }
    // Distinct foreground boulders anchor scale and provide close-up parallax.
    for (const [x, z, scale] of [[-5, 13, 1.8], [13, 16, .9], [-21, 3, 2.1], [24, -22, 1.5]]) {
      const rock = new THREE.Mesh(this.rockGeometry(x + 22), this.rockMaterial('#88705a'));
      rock.position.set(x, heightAt(x, z) + scale * .17, z);
      rock.scale.set(scale * 1.2, scale, scale);
      rock.castShadow = rock.receiveShadow = true;
      this.scene.add(rock); this.obstacles.push({ x, z, radius: scale * 1.3 });
    }
  }

  private buildOutcrop() {
    const rng = random(108);
    for (let column = 0; column < 5; column++) {
      const x = -18 + column * 1.8, z = -9 + Math.sin(column) * 1.1;
      const h = 1.7 + rng() * 1.8;
      const geo = new THREE.CylinderGeometry(1.25, 1.95, h, 13, 48);
      const vertices = geo.attributes.position;
      for (let i = 0; i < vertices.count; i++) {
        const vx = vertices.getX(i), vy = vertices.getY(i), vz = vertices.getZ(i);
        const band = Math.sin(vy * 17 + column * 2) * .045 + Math.sin(vy * 8) * .06;
        const shape = .87 + noise(vx * 1.3 + column * 8, vz * 1.3) * .28 + band;
        vertices.setXYZ(i, vx * shape + vy * .09, vy + noise(vx * 2, vz * 2) * .15, vz * shape * .85);
      }
      geo.computeVertexNormals();
      const rock = new THREE.Mesh(geo, this.rockMaterial(column % 2 ? '#a58b71' : '#94765e'));
      rock.position.set(x, heightAt(x, z) + h / 2 - .15, z);
      rock.rotation.y = column * .5;
      rock.castShadow = rock.receiveShadow = true;
      this.scene.add(rock);
      this.obstacles.push({ x, z, radius: 2 });
    }
  }

  private bindControls() {
    const signal = this.abort.signal;
    const isUI = (target: EventTarget | null) => target instanceof HTMLElement && !!target.closest('button, a, select, input, dialog');
    window.addEventListener('keydown', e => {
      if (!this.active || isUI(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault(); this.keys.add(e.code); this.target = null;
      }
    }, { signal });
    window.addEventListener('keyup', e => this.keys.delete(e.code), { signal });
    window.addEventListener('blur', () => this.clearInput(), { signal });
    document.addEventListener('visibilitychange', () => {
      this.clearInput();
      if (document.hidden) cancelAnimationFrame(this.frame);
      else { this.previous = 0; this.frame = requestAnimationFrame(this.tick); }
    }, { signal });
    window.addEventListener('resize', () => this.resize(), { signal });
    this.canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.options.onError(); }, { signal });
    this.canvas.addEventListener('pointerdown', e => {
      if (!this.active || e.button !== 0 || this.drag) return;
      this.canvas.focus({ preventScroll: true });
      this.target = null;
      this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false };
      this.canvas.setPointerCapture(e.pointerId);
    }, { signal });
    this.canvas.addEventListener('pointermove', e => {
      if (!this.drag || this.drag.id !== e.pointerId) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      this.drag.moved ||= Math.hypot(e.clientX - this.drag.startX, e.clientY - this.drag.startY) > 5;
      if (this.drag.moved) {
        this.yaw -= dx * .003;
        this.pitch = THREE.MathUtils.clamp(this.pitch - dy * .003, -1.15, 1.15);
      }
      this.drag.x = e.clientX; this.drag.y = e.clientY;
    }, { signal });
    this.canvas.addEventListener('pointerup', e => {
      if (!this.drag || this.drag.id !== e.pointerId) return;
      if (!this.drag.moved) this.pickGround(e.clientX, e.clientY);
      this.drag = null;
    }, { signal });
    this.canvas.addEventListener('pointercancel', () => { this.drag = null; }, { signal });
    this.canvas.addEventListener('lostpointercapture', () => { this.drag = null; }, { signal });
  }

  private pickGround(x: number, y: number) {
    const rect = this.canvas.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2((x - rect.left) / rect.width * 2 - 1, -(y - rect.top) / rect.height * 2 + 1), this.camera);
    const hit = this.raycaster.intersectObject(this.terrain)[0];
    if (!hit || Math.hypot(hit.point.x - this.position.x, hit.point.z - this.position.z) > 25) return;
    const target = { x: hit.point.x, z: hit.point.z };
    if (!canStand(target, this.obstacles)) return;
    this.needsRender = true;
    if (this.reducedMotion) {
      this.position = target;
    } else this.target = target;
  }

  private clearInput() { this.keys.clear(); this.target = null; this.drag = null; }
  setActive(active: boolean) { this.active = active; this.clearInput(); }
  hold(code: string, held: boolean) {
    if (held && this.active) { this.keys.add(code); this.target = null; }
    else this.keys.delete(code);
  }
  setQuality(quality: Quality) {
    this.quality = quality;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, quality === 'high' ? 1.6 : 1));
    this.sun.castShadow = quality === 'high';
    this.renderer.shadowMap.needsUpdate = true;
    this.resize();
  }
  visit(index: number) {
    const site = SITES[index];
    if (!site) return;
    this.clearInput();
    this.position = { ...site.visit };
    this.yaw = Math.atan2(-(site.x - site.visit.x), -(site.z - site.visit.z));
    this.pitch = index === 1 ? -.38 : -.04;
  }
  reset() { this.clearInput(); this.position = { x: START.x, z: START.z }; this.yaw = START.yaw; this.pitch = START.pitch; }
  private resize() {
    const width = this.canvas.clientWidth, height = this.canvas.clientHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.needsRender = true;
  }
  private setCamera() {
    const y = heightAt(this.position.x, this.position.z) + EYE_HEIGHT;
    if (this.camera.position.x !== this.position.x || this.camera.position.y !== y ||
        this.camera.position.z !== this.position.z || this.camera.rotation.x !== this.pitch ||
        this.camera.rotation.y !== this.yaw) this.needsRender = true;
    this.camera.position.set(this.position.x, y, this.position.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0);
  }

  private tick = (time: number) => {
    if (this.disposed || document.hidden) return;
    const dt = this.previous ? Math.min((time - this.previous) / 1000, .05) : 0;
    this.previous = time;
    if (this.active) {
      const forward = Number(this.keys.has('KeyW') || this.keys.has('ArrowUp')) - Number(this.keys.has('KeyS') || this.keys.has('ArrowDown'));
      const side = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));
      this.yaw += (Number(this.keys.has('ArrowLeft')) - Number(this.keys.has('ArrowRight'))) * dt * 1.25;
      let dx = (-Math.sin(this.yaw) * forward + Math.cos(this.yaw) * side);
      let dz = (-Math.cos(this.yaw) * forward - Math.sin(this.yaw) * side);
      if (this.target) {
        dx = this.target.x - this.position.x; dz = this.target.z - this.position.z;
        if (Math.hypot(dx, dz) < .2) { this.target = null; dx = dz = 0; }
      }
      const length = Math.hypot(dx, dz);
      if (length) {
        const next = movePlayer(this.position, { x: dx / length * dt * 3.1, z: dz / length * dt * 3.1 }, this.obstacles);
        const moved = Math.hypot(next.x - this.position.x, next.z - this.position.z);
        this.distance += moved;
        if (this.target && moved < dt * .2) this.target = null;
        this.position = next;
      }
    }
    if (this.targetRing.visible !== !!this.target) this.needsRender = true;
    this.targetRing.visible = !!this.target;
    if (this.target) this.targetRing.position.set(this.target.x, heightAt(this.target.x, this.target.z) + .06, this.target.z);
    this.setCamera();
    if (this.needsRender) {
      this.renderer.render(this.scene, this.camera);
      this.needsRender = false;
    }
    if (time - this.lastReport > 100) {
      this.lastReport = time;
      const nearest = SITES.findIndex(site => Math.hypot(this.position.x - site.x, this.position.z - site.z) < site.radius);
      this.options.onUpdate({ ...this.position, yaw: this.yaw, distance: this.distance, nearest,
        boundary: Math.abs(this.position.x) > WALK_LIMIT - .7 || Math.abs(this.position.z) > WALK_LIMIT - .7 });
    }
    this.frame = requestAnimationFrame(this.tick);
  };

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frame); this.abort.abort(); this.clearInput();
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          materials.add(material);
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        }
        if (object instanceof THREE.InstancedMesh) object.dispose();
      }
    });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
    this.sun?.shadow.dispose(); this.renderer.dispose(); this.scene.clear();
  }
}
