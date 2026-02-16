import * as THREE from "three";

/**
 * Reusable 3D follow camera helper.
 * - Follows a target with position/velocity (expects { pos: Vector3, vel: Vector3 }).
 * - Smooths camera motion and look direction.
 * - Keeps camera inside a bounding cube and prefers an inward-facing view near walls.
 */
class FollowCam3D {
  constructor(camera, {
    followDistance = 30,
    followHeight = 2.2,
    followLerp = 0.01,
    lookLerp = 0.01,
    bound = 14,
    boxMargin = 3,
    maxSpeed = 0.4,  // world units per dt (~frame)
    minSpeed = 0.0   // optional minimum movement per dt
  } = {}) {
    this.camera = camera;
    this.followDistance = followDistance;
    this.followHeight = followHeight;
    this.followLerp = followLerp;
    this.lookLerp = lookLerp;
    this.bound = bound;
    this.boxMargin = boxMargin;
    this.maxSpeed = maxSpeed;
    this.minSpeed = minSpeed;
    this.target = null;
    this.lookTarget = new THREE.Vector3(0, 0, -1);
    this.rollStrength = 5.6;
    this.maxRoll = 0.85;   // ~20 degrees
    this.rollLerp = 1.8;  // smoothing for roll angle
    this.rollAngle = 0.5;
  }

  setTarget(target) {
    this.target = target || null;
  }

  update(dt) {
    const camera = this.camera;
    const target = this.target;
    if (!camera || !target || !target.pos || !target.vel) return;

    const targetPos = target.pos;
    const vel = target.vel.clone();
    if (vel.lengthSq() < 1e-4) {
      vel.set(1, 0, 0);
    }
    vel.normalize();

    const { bound, boxMargin } = this;

    const nearLeft = targetPos.x < -bound + boxMargin;
    const nearRight = targetPos.x > bound - boxMargin;
    const nearBottom = targetPos.y < -bound + boxMargin;
    const nearTop = targetPos.y > bound - boxMargin;
    const nearBack = targetPos.z < -bound + boxMargin;
    const nearFront = targetPos.z > bound - boxMargin;

    const inwardDir = new THREE.Vector3(
      nearLeft ? 1 : nearRight ? -1 : 0,
      nearBottom ? 1 : nearTop ? -1 : 0,
      nearBack ? 1 : nearFront ? -1 : 0
    );

    let followDir = vel.clone().multiplyScalar(-1);
    if (inwardDir.lengthSq() > 0) {
      inwardDir.normalize();
      // Blend between "behind the trail" and "toward the cube interior" when near walls
      followDir.lerp(inwardDir, 0.7);
    }
    followDir.normalize();

    const offset = followDir.multiplyScalar(this.followDistance);
    const up = new THREE.Vector3(0, 1, 0).multiplyScalar(this.followHeight);
    const desiredPos = new THREE.Vector3().copy(targetPos).add(offset).add(up);

    desiredPos.x = THREE.MathUtils.clamp(desiredPos.x, -bound + boxMargin, bound - boxMargin);
    desiredPos.y = THREE.MathUtils.clamp(desiredPos.y, -bound + boxMargin, bound - boxMargin);
    desiredPos.z = THREE.MathUtils.clamp(desiredPos.z, -bound + boxMargin, bound - boxMargin);

    // Move toward desiredPos, but cap maximum and minimum speed so jumps to new targets are smooth
    const toDesired = new THREE.Vector3().subVectors(desiredPos, camera.position);
    const dist = toDesired.length();
    if (dist > 0) {
      const timeScale = dt || 1;
      const maxStep = this.maxSpeed * timeScale;
      const minStep = this.minSpeed * timeScale;
      const desiredStep = dist * this.followLerp;
      let step = desiredStep;
      if (maxStep > 0) {
        step = Math.min(step, maxStep);
      }
      if (minStep > 0 && dist > minStep) {
        step = Math.max(step, minStep);
      }
      step = Math.min(step, dist); // never overshoot
      const t = step / dist;
      camera.position.add(toDesired.multiplyScalar(t));
    }

    const lookAhead = vel.clone().multiplyScalar(2);
    const desiredLook = new THREE.Vector3().copy(targetPos).add(lookAhead);
    this.lookTarget.lerp(desiredLook, this.lookLerp);

    // Bank/roll camera around its forward axis for a \"spaceship\" feel
    const forward = new THREE.Vector3().subVectors(this.lookTarget, camera.position).normalize();
    if (forward.lengthSq() > 1e-6) {
      const targetRoll = THREE.MathUtils.clamp(-vel.x * this.rollStrength, -this.maxRoll, this.maxRoll);
      this.rollAngle += (targetRoll - this.rollAngle) * this.rollLerp;

      const baseUp = new THREE.Vector3(0, 1, 0);
      const rollQuat = new THREE.Quaternion().setFromAxisAngle(forward, this.rollAngle);
      const rolledUp = baseUp.applyQuaternion(rollQuat);
      camera.up.copy(rolledUp);
    }

    camera.lookAt(this.lookTarget);
  }
}

export default FollowCam3D;

