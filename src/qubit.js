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
  exp,
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
    rotation: Math.PI,
    name: 'Pauli X Gate',
    description: 'Similar to a classical NOT gate. Switches the |0⟩ and |1⟩ components of a qubit.',
    matrixTex: `X = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}`,
    eigenstates: [
      { state: '|+\\rangle', value: '+1' },
      { state: '|-\\rangle', value: '-1' }
    ]
  },
  y: {
    matrix: matrix([
      [0, complex(0, -1)],
      [complex(0, 1), 0]
    ]),
    axis: [new Vector3(0, 1, 0), new Vector3(0, -1, 0)],
    rotation: Math.PI,
    name: 'Pauli Y Gate',
    description: 'Switches the |0⟩ and |1⟩ components of a qubit, but adds π phase.',
    matrixTex: `Y = \\begin{bmatrix} 0 & -i \\\\ i & 0 \\end{bmatrix}`,
    eigenstates: [
      { state: '|R\\rangle', value: '+1' },
      { state: '|L\\rangle', value: '-1' }
    ]
  },
  z: {
    matrix: matrix([
      [1, 0],
      [0, -1]
    ]),
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    rotation: Math.PI,
    name: 'Pauli Z Gate',
    description:
      'Adds π phase to a qubit, corresponding to π radians of rotation around the z-axis.',
    matrixTex: `Z = \\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}`,
    eigenstates: [
      { state: '|0\\rangle', value: '+1' },
      { state: '|1\\rangle', value: '-1' }
    ]
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
    rotation: Math.PI,
    name: 'Hadamard Gate',
    description:
      'Switches the X and Z axes, turning phaseflips into bitflips. For example: HXH = Z and HZH = X.',
    matrixTex: `H = \\frac{1}{\\sqrt{2}} \\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}`,
    eigenstates: [
      { state: '(1 + \\sqrt{2})|0\\rangle + |1\\rangle', value: '+1' },
      { state: '(1 - \\sqrt{2})|0\\rangle + |1\\rangle', value: '-1' }
    ]
  },
  s: {
    matrix: matrix([
      [1, 0],
      [0, complex(0, 1)]
    ]),
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    rotation: Math.PI / 2,
    name: 'S Gate',
    description:
      'Adds π/2 phase to a qubit. The square root of the Z gate, and the square of the T gate.',
    matrixTex: `S = \\begin{bmatrix} 1 & 0  \\\\ 0 & i \\end{bmatrix}`,
    eigenstates: [
      { state: '|0\\rangle', value: '+1' },
      { state: '|1\\rangle', value: '+i' }
    ]
  },
  sdg: {
    matrix: matrix([
      [1, 0],
      [0, complex(0, -1)]
    ]),
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    rotation: -Math.PI / 2,
    name: 'S† Gate',
    description:
      'Subtracts π/2 phase from a qubit. The inverse (and conjugate transpose) of the S gate.',
    matrixTex: `S^\\dagger = \\begin{bmatrix} 1 & 0  \\\\ 0 & -i \\end{bmatrix}`,
    eigenstates: [
      { state: '|0\\rangle', value: '+1' },
      { state: '|1\\rangle', value: '-i' }
    ]
  },
  t: {
    matrix: matrix([
      [1, 0],
      [0, Complex.fromPolar(1, Math.PI / 4)]
    ]),
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    rotation: Math.PI / 4,
    name: 'T Gate',
    description: 'Adds π/4 phase to a qubit. The square root of the S gate.',
    matrixTex: `S = \\begin{bmatrix} 1 & 0  \\\\ 0 & e^{\\frac{\\pi i}{4}} \\end{bmatrix}`,
    eigenstates: [
      { state: '|0\\rangle', value: '+1' },
      { state: '|1\\rangle', value: 'e^{\\frac{\\pi i}{4}}' }
    ]
  },
  tdg: {
    matrix: matrix([
      [1, 0],
      [0, Complex.fromPolar(1, -Math.PI / 4)]
    ]),
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    rotation: -Math.PI / 4,
    name: 'T† Gate',
    description:
      'Subtracts π/4 phase from a qubit. The inverse (and conjugate transpose) of the T gate.',
    matrixTex: `T^\\dagger = \\begin{bmatrix} 1 & 0  \\\\ 0 & e^{\\frac{-\\pi i}{4}} \\end{bmatrix}`,
    eigenstates: [
      { state: '|0\\rangle', value: '+1' },
      { state: '|1\\rangle', value: 'e^{\\frac{-\\pi i}{4}}' }
    ]
  },
  'rx+': {
    axis: [new Vector3(1, 0, 0), new Vector3(-1, 0, 0)],
    name: 'Rx (+θ) Gate',
    description: 'Parameterized gate that rotates +θ radians around the x-axis.',
    matrixTex: `Rx(\\theta) = \\begin{bmatrix}
    \\cos\\left(\\frac{\\theta}{2}\\right) & -i\\sin(\\frac{\\theta}{2}) \\\\
    -i\\sin(\\frac{\\theta}{2}) & \\cos(\\frac{\\theta}{2})
    \\end{bmatrix}`,
    eigenstates: [
      {
        state: '|+\\rangle',
        value: '\\cos\\left(\\frac{\\theta}{2}\\right) - i\\sin\\left(\\frac{\\theta}{2}\\right)'
      },
      {
        state: '|-\\rangle',
        value: '\\cos\\left(\\frac{\\theta}{2}\\right) + i\\sin\\left(\\frac{\\theta}{2}\\right)'
      }
    ]
  },
  'rx-': {
    axis: [new Vector3(1, 0, 0), new Vector3(-1, 0, 0)],
    name: 'Rx (-θ) Gate',
    description: 'Parameterized gate that rotates -θ radians around the x-axis.',
    matrixTex: `Rx(\\theta) = \\begin{bmatrix}
    \\cos\\left(-\\frac{\\theta}{2}\\right) & -i\\sin(-\\frac{\\theta}{2}) \\\\
    -i\\sin(-\\frac{\\theta}{2}) & \\cos(-\\frac{\\theta}{2})
    \\end{bmatrix}`,
    eigenstates: [
      {
        state: '|+\\rangle',
        value: '\\cos\\left(-\\frac{\\theta}{2}\\right) - i\\sin\\left(-\\frac{\\theta}{2}\\right)'
      },
      {
        state: '|-\\rangle',
        value: '\\cos\\left(-\\frac{\\theta}{2}\\right) + i\\sin\\left(-\\frac{\\theta}{2}\\right)'
      }
    ]
  },
  'ry+': {
    axis: [new Vector3(0, 1, 0), new Vector3(0, -1, 0)],
    name: 'Ry (+θ) Gate',
    description: 'Parameterized gate that rotates +θ radians around the y-axis.',
    matrixTex: `Ry(\\theta) = \\begin{bmatrix}
    \\cos\\left(\\frac{\\theta}{2}\\right) & -\\sin(\\frac{\\theta}{2}) \\\\
    \\sin(\\frac{\\theta}{2}) & \\cos(\\frac{\\theta}{2})
    \\end{bmatrix}`,
    eigenstates: [
      {
        state: '|R\\rangle',
        value: '\\cos\\left(\\frac{\\theta}{2}\\right) - i\\sin\\left(\\frac{\\theta}{2}\\right)'
      },
      {
        state: '|L\\rangle',
        value: '\\cos\\left(\\frac{\\theta}{2}\\right) + i\\sin\\left(\\frac{\\theta}{2}\\right)'
      }
    ]
  },
  'ry-': {
    axis: [new Vector3(0, 1, 0), new Vector3(0, -1, 0)],
    name: 'Ry (-θ) Gate',
    description: 'createQubitStatevectorTex',
    matrixTex: `Ry(\\theta) = \\begin{bmatrix}
    \\cos\\left(-\\frac{\\theta}{2}\\right) & -\\sin(-\\frac{\\theta}{2}) \\\\
    \\sin(-\\frac{\\theta}{2}) & \\cos(-\\frac{\\theta}{2})
    \\end{bmatrix}`,
    eigenstates: [
      {
        state: '|R\\rangle',
        value: '\\cos\\left(-\\frac{\\theta}{2}\\right) - i\\sin\\left(-\\frac{\\theta}{2}\\right)'
      },
      {
        state: '|L\\rangle',
        value: '\\cos\\left(-\\frac{\\theta}{2}\\right) + i\\sin\\left(-\\frac{\\theta}{2}\\right)'
      }
    ]
  },
  'rz+': {
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    name: 'Rz (+θ) Gate',
    description: 'Parameterized gate that rotates +θ radians around the z-axis.',
    matrixTex: `Rz(\\theta) = \\begin{bmatrix}
    e^{-\\theta/2 i} & 0 \\\\
    0 & e^{\\theta/2 i}
    \\end{bmatrix}`,
    eigenstates: [
      { state: '|0\\rangle', value: 'e^{-\\theta/2i}' },
      { state: '|1\\rangle', value: 'e^{\\theta/2i}' }
    ]
  },
  'rz-': {
    axis: [new Vector3(0, 0, 1), new Vector3(0, 0, -1)],
    name: 'Rz (-θ) Gate',
    description: 'Parameterized gate that rotates -θ radians around the z-axis.',
    matrixTex: `Rz(\\theta) = \\begin{bmatrix}
    e^{\\theta/2 i} & 0 \\\\
    0 & e^{-\\theta/2 i}
    \\end{bmatrix}`,
    eigenstates: [
      { state: '|0\\rangle', value: 'e^{\\theta/2i}' },
      { state: '|1\\rangle', value: 'e^{-\\theta/2i}' }
    ]
  },
  custom: {
    name: 'Custom Gate',
    description:
      'Specify a custom gate through two points and a sequence of H and T gates will be used to approximate the rotation.'
  },
  standard: {
    name: 'Standard Gates',
    description: 'Return to the predefined gates.'
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

export function applyGate(statevector, gate) {
  const res = multiply(gate.matrix, statevector)
  return normalizeStatevector(res)
}

function normalizeStatevector(statevector) {
  /**
   * Returns statevector with real zero component and phase encoded on one component.
   * @param statevector math.matrix object of size 2.
   * @return js array of size 2 [number, math.complex]
   */
  // convoluted way to get the first element because of mathjs
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

export function generateRotationMatrix(axis, angle) {
  if (axis === 'x') {
    return matrix([
      [cos(angle / 2), multiply(complex(0, -1), sin(angle / 2))],
      [multiply(complex(0, -1), sin(angle / 2)), cos(angle / 2)]
    ])
  } else if (axis === 'y') {
    return matrix([
      [cos(angle / 2), -1 * sin(angle / 2)],
      [sin(angle / 2), cos(angle / 2)]
    ])
  } else if (axis === 'z') {
    return matrix([
      [exp(multiply(complex(0, -1), angle / 2)), 0],
      [0, exp(multiply(complex(0, 1), angle / 2))]
    ])
  }
}

export function createQubitStatevectorTex(qubitPosition, qubitName) {
  const statevector = calculateStatevector(qubitPosition)
  const { r: oneAmplitude, phi: phase } = statevector[1].toPolar()
  const oneComponentTex =
    oneAmplitude.toFixed(2) === '0.00'
      ? '0.00'
      : phase.toFixed(2) === '0.00'
        ? oneAmplitude.toFixed(2)
        : `${oneAmplitude.toFixed(2)}e^{${phase.toFixed(2)}i}`
  return `|${qubitName}\\rangle =
  \\begin{bmatrix}
    ${statevector[0].toFixed(2)} \\\\ ${oneComponentTex}
  \\end{bmatrix}
  `
}
