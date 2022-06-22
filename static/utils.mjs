export function lerp(current, target, frames) {
    return current + (target-current)/frames;
}