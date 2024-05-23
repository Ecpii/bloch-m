import {
  ctranspose,
  matrix,
  divide,
  sqrt,
  subtract,
  multiply,
  norm,
  inv,
  eigs,
  acos,
  trace,
  asin,
  nthRoot,
  cos,
  sin,
  transpose,
  index,
  dot,
  cross,
  identity,
  add
} from 'mathjs'
import basicApproximations from './assets/basicApproximations.json'
const GATE_MATRICES = {
  h: divide(
    matrix([
      [1, 1],
      [1, -1]
    ]),
    sqrt(2)
  )
}
class GateSequence {
  gates = []
  matrices = []
  product
  // constructor() {

  // }
  adjoint() {
    const res = new GateSequence()
    for (const matrix of this.matrices.toReversed()) {
      res.matrix.push(inv(matrix))
    }
    for (const gate of this.gates.toReversed()) {
      if (gate === 't') {
        res.gates.push('tdg')
      } else if (gate === 'tdg') {
        res.gates.push('t')
      } else {
        res.gates.push('h')
      }
    }
    res.product = ctranspose(this.product)
    return res
  }
}

export function solovayKitaev(target, n) {
  if (n === 0) {
    return findClosestBasicApproximation(target)
  }
  const previousLevelApprox = solovayKitaev(target, n - 1)
  const delta = target.dot(previousLevelApprox.adjoint())
}

function findClosestBasicApproximation(target) {
  const targetMatrix = target.product
  let minLoss = Infinity
  let minLossSequence
  for (const sequence of basicApproximations) {
    const sequenceMatrix = matrix(sequence.matrix)
    const loss = norm(subtract(sequenceMatrix, targetMatrix), 'fro')
    if (loss < minLoss) {
      minLoss = loss
      minLossSequence = sequence
    }
  }
  return minLossSequence
}

function constructSO3FromAxisAngle(axis, angle) {
  if (axis === 'x') {
    return matrix([
      [1, 0, 0],
      [0, cos(angle), sin(angle)],
      [0, -1 * sin(angle), cos(angle)]
    ])
  } else if (axis === 'y') {
    return matrix([
      [cos(angle), 0, sin(angle)],
      [0, 1, 0],
      [-1 * sin(angle), 0, cos(angle)]
    ])
  }
}

function computeRotationAxis(so3Matrix) {
  const matrixTrace = trace(so3Matrix)
  const theta = acos((1 / 2) * (matrixTrace - 1))
  if (sin(theta) > 1e-9) {
    return [
      (so3Matrix.get([2, 1]) - so3Matrix.get([1, 2])) / (2 * sin(theta)),
      (so3Matrix.get([0, 2]) - so3Matrix.get([2, 0])) / (2 * sin(theta)),
      (so3Matrix.get([1, 0]) - so3Matrix.get([0, 1])) / (2 * sin(theta))
    ]
  } else {
    return [1, 0, 0]
  }
}

function computeRotationBetween(from, to) {
  const fromVec = from / norm(from, 'fro')
  const toVec = to / norm(to, 'fro')

  const dotProduct = dot(fromVec, toVec)
  const crossProduct = cross(fromVec, toVec)
  const crossDot = dot(crossProduct, crossProduct)
  return divide(add(add(identity(3), crossProduct), crossDot), 1 + dotProduct)
}

function balancedCommutatorDecomposition(so3Matrix) {
  // rotation angle of so3Matrix
  const angleTheta = acos((1 / 2) * (trace(so3Matrix) - 1))
  // rotation angles for vTilde and wTilde
  const anglePhi = 2 * asin(nthRoot(1 - cos(angleTheta / 2), 4) / nthRoot(2, 4))
  const vTilde = constructSO3FromAxisAngle('x', anglePhi)
  const wTilde = constructSO3FromAxisAngle('y', anglePhi)

  // known as N in the Liang & Thompson paper (pg 17), known as U in the Dawson & Nielson paper (pg 8, equation 11)
  const commutator = multiply(
    multiply(multiply(vTilde, wTilde), ctranspose(vTilde)),
    ctranspose(wTilde)
  )

  // these two used to find S such that V = S vTilde Sdg and W = S wTilde Sdg
  const so3Axis = computeRotationAxis(so3Matrix)
  const commutatorAxis = computeRotationAxis(commutator)

  // the S matrix
  const simMatrix = computeRotationBetween(commutatorAxis, so3Axis)
  const simMatrixdg = ctranspose(simMatrix)

  const v = dot(dot(simMatrix, vTilde), simMatrixdg)
  const w = dot(dot(simMatrix, wTilde), simMatrixdg)

  return v, w
}
