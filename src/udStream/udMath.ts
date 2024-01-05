export function RadiansToDegrees(radians: number) {
  return radians * 57.295779513082320876798154814105
}

export function DegreesToRadians(degrees: number) {
  return degrees * 0.01745329251994329576923690768489
}

// Distance Conversion
export function MeterToMillimeter(meters: number) {
  return meters * 1000.0
}

export function MeterToCentimeter(meters: number) {
  return meters * 100.0
}

export function MeterToKiloMeter(meters: number) {
  return meters / 1000.0
}

export function MeterToUSInch(meters: number) {
  return meters * 39.37
}

export function MeterToUSFoot(meters: number) {
  return meters * 3.2808333333
}

export function MeterToUSMile(meters: number) {
  return (meters / 1000.0) * 0.6213699495
}

export function MeterToNauticalMile(meters: number) {
  return (meters / 1000.0) * 0.5399568035
}

// Area Conversion
export function SquareMeterToSquareCentimeter(sqMeter: number) {
  return sqMeter * 10000.0
}

export function SquareMeterToSquareMillimeter(sqMeter: number) {
  return sqMeter * 1000000.0
}

export function SquareMeterToSquareKilometer(sqMeter: number) {
  return sqMeter / 1000000.0
}

export function SquareMeterToHectare(sqMeter: number) {
  return sqMeter / 10000.0
}

export function SquareMeterToUSSquareFoot(sqMeter: number) {
  return sqMeter * 3.2808333333 * 3.2808333333
}

export function SquareMeterToUSSquareMile(sqMeter: number) {
  return (sqMeter / 1000000.0) * 0.6213699495 * 0.6213699495
}

export function SquareMeterToAcre(sqMeter: number) {
  return (sqMeter / 10000.0) * 2.4710538147
}

export function SquareMeterToUSSquareInch(sqMeter: number) {
  return sqMeter * 39.37 * 39.37
}
