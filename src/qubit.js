import { log, i, exp, Complex, mod } from 'mathjs'
export function statevectorToProbabilities(statevector) {
  const zeroAmplitude = statevector[0]
  const zeroProbability = zeroAmplitude ** 2
  const { r: oneAmplitude, phi } = statevector[1].toPolar()
  const oneProbability = oneAmplitude ** 2
  const phase = mod(phi, 2 * Math.PI)
  return { zeroProbability, oneProbability, phase }
}

export function probabilitiesToStatevector(zeroProbability, phase) {
  const zeroAmplitude = Math.sqrt(zeroProbability)
  const oneAmplitude = Math.sqrt(1 - zeroProbability)
  return [zeroAmplitude, Complex.fromPolar(oneAmplitude, phase)]
}

export function calculateAzimuth(x, y) {
  if (y > 0) {
    return Math.PI / 2 - Math.atan(x / y)
  } else if (y < 0) {
    return Math.PI / 2 - Math.atan(x / y) + Math.PI
  } else {
    return 0
  }
}

export function calculateStatevector({ x, y, z }) {
  const phase = calculateAzimuth(x, y)
  const zeroProbability = (z + 1) / 2
  return probabilitiesToStatevector(zeroProbability, phase)
}
