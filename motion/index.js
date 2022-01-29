function nonlinear(t, speed = 1.0) {
    return Math.floor(Math.max(100 - t, 0) / 15 + 1) * speed;
}

function linear(t, speed = 1.0) {
    return 100 / 10 * speed;
}

export {
    nonlinear,
    linear
}