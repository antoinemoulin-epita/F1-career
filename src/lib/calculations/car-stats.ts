export function calculateDerivedStats(
    motor: number,
    aero: number,
    chassis: number,
    engineChangePenalty: boolean,
) {
    const effectiveChassis = engineChangePenalty ? chassis - 1 : chassis;
    return {
        total: motor + aero + chassis,
        speed: Math.round((aero + motor) / 2),
        grip: Math.round((aero + effectiveChassis) / 2),
        acceleration: motor,
        effectiveChassis,
    };
}
