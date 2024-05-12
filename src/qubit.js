/**
 * All the math functions for qubits, using math.js.
 * "Probabilities" in functions refer to an object like
 * {
 *  zeroProbability: number between 0 and 1,
 *  oneProbability: number between 0 and 1, should be close to 1 - zeroProbability,
 *  phase: angle in radians from positive x axis, between 0 and 6.283... (2pi)
 * }
 * "Statevector" is an array of two numbers. The first represents the amplitude of the
 * zero state (square root of the probability), and the second one represents that of the
 * one state but can be a complex number as it stores phase information.
 */
import {
  divide,
  subset,
  Complex,
  matrix,
  multiply,
  mod,
  index,
  cos,
  sin,
  sqrt,
  complex
} from 'mathjs'
import { Vector3 } from 'three'

export const GATES = {
  x: {
    matrix: matrix([
      [0, 1],
      [1, 0]
    ]),
    // i don't know enough linear algebra to find these eigenvectors programmatically D:
    axis: [new Vector3(1, 0, 0), new Vector3(-1, 0, 0)],
    rotation: Math.PI
  },
  y: {
    matrix: matrix([
      [0, complex(0, -1)],
      [complex(0, 1), 0]
    ]),
    axis: [new Vector3(0, 1, 0), new Vector3(0, -1, 0)],
    rotation: Math.PI
  },
  z: {
    matrix: matrix([
      [1, 0],
      [0, -1]
    ]),
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    rotation: Math.PI
  },
  h: {
    matrix: divide(
      matrix([
        [1, 1],
        [1, -1]
      ]),
      sqrt(2)
    ),
    axis: [new Vector3(1 / sqrt(2), 0, 1 / sqrt(2)), new Vector3(-1 / sqrt(2), 0, -1 / sqrt(2))],
    rotation: Math.PI
  },
  s: {
    matrix: matrix([
      [1, 0],
      [0, complex(0, 1)]
    ]),
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    rotation: Math.PI / 2
  },
  sdg: {
    matrix: matrix([
      [1, 0],
      [0, complex(0, -1)]
    ]),
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    rotation: -Math.PI / 2
  },
  t: {
    matrix: matrix([
      [1, 0],
      [0, Complex.fromPolar(1, Math.PI / 4)]
    ]),
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    rotation: Math.PI / 4
  },
  tdg: {
    matrix: matrix([
      [1, 0],
      [0, Complex.fromPolar(1, -Math.PI / 4)]
    ]),
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    rotation: -Math.PI / 4
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

export function calculateCoordinates(statevector) {
  const phaseAngle = statevector[1].toPolar().phi
  const z = statevector[0] ** 2 * 2 - 1
  const remainingRadius = sqrt(1 - z ** 2)
  const x = remainingRadius * cos(phaseAngle)
  const y = remainingRadius * sin(phaseAngle)
  return new Vector3(x, y, z)
}

export function applyGate(statevector, gateName) {
  const res = multiply(GATES[gateName].matrix, statevector)
  return normalizeStatevector(res)
}

function normalizeStatevector(statevector) {
  /**
   * Returns statevector with real zero component and phase encoded on one component.
   * @param statevector math.matrix object of size 2.
   */
  const zero = subset(statevector, index(0))
  if (!zero?.isComplex) {
    return statevector
  }
  const one = subset(statevector, index(1))
  const { r: zeroAmplitude, phi: zeroAngle } = zero.toPolar()
  const { r: oneAmplitude, phi: oneAngle } = one.toPolar()
  const newOneAngle = oneAngle - zeroAngle
  return [zeroAmplitude, Complex.fromPolar(oneAmplitude, newOneAngle)]
}
