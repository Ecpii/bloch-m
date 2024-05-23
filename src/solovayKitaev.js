import {
  ctranspose,
  matrix,
  divide,
  sqrt,
  subtract,
  multiply,
  norm,
  inv,
  acos,
  trace,
  asin,
  nthRoot,
  cos,
  sin,
  dot,
  cross,
  identity,
  add,
  det
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
  product = identity(3)

  static fromsu2Matrix(matrix) {
    const res = new GateSequence()
    res.product = convertSu2ToSo3(matrix)
    return res
  }
  static fromso3Matrix(matrix) {
    const res = new GateSequence()
    res.product = matrix
    return res
  }

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
  dot(other) {
    const res = new GateSequence()
    res.gates = other.gates.concat(this.gates)
    res.matrices = other.matrices.concat(this.matrices)
    res.product = dot(this.product, other.product)
    return res
  }

  clean() {
    let index = 0
    while (index < this.gates.length - 1) {
      const currentName = this.gates[index]
      const nextName = this.gates[index + 1]
      if (nextName === inverseGateName(currentName)) {
        this.gates.splice(index, 2)
        // check if this removal caused another inverse neighbor
        index--
      }
      index++
    }
  }
}

function inverseGateName(gateName) {
  if (gateName === 'h') {
    return 'h'
  } else if (gateName === 't') {
    return 'tdg'
  } else if (gateName === 'tdg') {
    return 't'
  }
}

function convertSu2ToSo3(mat) {
  const a = mat.get([0, 0])?.re ?? mat.get([0, 0])
  const b = mat.get([0, 0])?.im ?? 0
  const c = -1 * (mat.get([0, 1])?.re ?? mat.get([0, 1]))
  const d = -1 * (mat.get([0, 1])?.im ?? 0)
  return matrix([
    [a ** 2 - b ** 2 - c ** 2 + d ** 2, 2 * a * b + 2 * c * d, -2 * a * c + 2 * b * d],
    [-2 * a * b + 2 * c * d, a ** 2 - b ** 2 + c ** 2 - d ** 2, 2 * a * d + 2 * b * c],
    [2 * a * c + 2 * b * d, 2 * b * c - 2 * a * d, a ** 2 + b ** 2 - c ** 2 - d ** 2]
  ])
}

export function solovayKitaevFromU2(targetMatrix, n) {
  const phaseFactor = 1 / sqrt(det(targetMatrix))
  const inputSequence = GateSequence.fromsu2Matrix(multiply(phaseFactor, targetMatrix))
  // const globalPhase = atan2(phaseFactor.im, phaseFactor.re)

  const resSequence = solovayKitaev(inputSequence, n)
  resSequence.clean()
}

function solovayKitaev(u, n) {
  if (n === 0) {
    return findClosestBasicApproximation(u)
  }
  const uApprox = solovayKitaev(u, n - 1)
  const delta = u.dot(uApprox.adjoint())

  const [v, w] = balancedCommutatorDecomposition(delta)

  const vApprox = solovayKitaev(v, n - 1)
  const wApprox = solovayKitaev(w, n - 1)

  return vApprox.dot(wApprox).dot(vApprox.adjoint()).dot(wApprox.adjoint()).dot(uApprox)
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

  return [GateSequence.fromso3Matrix(v), GateSequence.fromso3Matrix(w)]
}
