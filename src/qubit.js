import { Complex, Matrix, complex, mod } from 'mathjs'
import { Vector3 } from 'three'
export const GATES = {
  // Y: new Matrix([
  //   [0, complex(0, -1)],
  //   [complex(0, 1), 0]
  // ]),
  x: {
    matrix: new Matrix([
      [0, 1],
      [1, 0]
    ]),
    axis: [new Vector3(1, 0, 0), new Vector3(-1, 0, 0)],
    rotation: Math.PI
  },
  z: {
    matrix: new Matrix([
      [1, 0],
      [0, -1]
    ]),
    // i don't know enough linear algebra to find these eigenvectors programmatically D:
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    rotation: Math.PI
  }
}
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
