/**
 * The Solovay-Kitaev algorithm and functions needed to run it are in this file.
 * Much of the code is taken from Qiskit's implementation of the algorithm:
 * https://github.com/Qiskit/qiskit/blob/stable/1.1/qiskit/synthesis/discrete_basis/solovay_kitaev.py#L201
 */
import {
  ctranspose,
  matrix,
  divide,
  sqrt,
  subtract,
  multiply,
  norm,
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
  det,
  complex
} from 'mathjs'
// this contains the precomputed sequences of h, t, and tdg gates with their so3 matrices
// generated from a function in qiskit, see generate_basic_approximations_json.py
import basicApproximations from './basicApproximations.json'

/**
 * Class representing a sequence of gates.
 */
class GateSequence {
  // list of the strings "h", "t", "tdg" in the order of the sequence
  gates = []
  // so3 matrix representing the product of all the gates
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

  /**
   * Get the conjugate transpose of this GateSequence. Does not mutate original, and reorders
   * gate names in generated GateSequence.
   * @returns GateSequence representing the conjugate transpose of this GateSequence.
   */
  adjoint() {
    const res = new GateSequence()
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
  /**
   * Computes the dot product of this GateSequence and the provided argument. Does not modify
   * either GateSequence.
   * @param {GateSequence} other GateSequence to compute the dot product with
   * @returns new GateSequence representing dot product of the two sequences.
   */
  dot(other) {
    const res = new GateSequence()
    res.gates = other.gates.concat(this.gates)
    res.product = multiply(this.product, other.product)
    return res
  }

  /**
   * Removes gates that are inverses of each other and sequential in the gate sequence.
   */
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

export function computeSo3FromPoints(from, to) {
  const fromVector = [from.x, from.y, from.z]
  const toVector = [to.x, to.y, to.z]
  const so3Matrix = computeRotationBetween(fromVector, toVector)
  return so3Matrix
}

export function generateSo3Tex(so3Matrix, precision = 2) {
  return `
  \\begin{bmatrix}
  ${so3Matrix.get([0, 0]).toFixed(precision)} & ${so3Matrix.get([0, 1]).toFixed(precision)} & ${so3Matrix.get([0, 2]).toFixed(precision)} \\\\
  ${so3Matrix.get([1, 0]).toFixed(precision)} & ${so3Matrix.get([1, 1]).toFixed(precision)} & ${so3Matrix.get([1, 2]).toFixed(precision)} \\\\ 
  ${so3Matrix.get([2, 0]).toFixed(precision)} & ${so3Matrix.get([2, 1]).toFixed(precision)} & ${so3Matrix.get([2, 2]).toFixed(precision)}
  \\end{bmatrix}
  `
}

export function computeSo3TexFromPoints(from, to) {
  return generateSo3Tex(computeSo3FromPoints(from, to))
}

export function solovayKitaevFromPoints(from, to, n) {
  const so3Matrix = computeSo3FromPoints(from, to)
  return solovayKitaevFromSo3(so3Matrix, n)
}

export function solovayKitaevFromSo3(so3Matrix, n) {
  const inputSequence = GateSequence.fromso3Matrix(so3Matrix)
  const resSequence = solovayKitaev(inputSequence, n)
  resSequence.clean()
  return resSequence
}

/**
 * Finds the Solovay-Kitaev approximation (using basis gates H, T, and T dagger)
 * of the given 2x2 matrix.
 * @param {matrix} targetMatrix 2x2 matrix in U(2), should be valid operation on a qubit
 * @param {Number} n recursion depth
 * @returns {GateSequence} object where the key "gates" gives a list of "h", "t", and "tdg"
 * in the order created by the approximation, and "product" gives a 3x3 SO(3) matrix representing
 * the product of these gates
 */
export function solovayKitaevFromU2(targetMatrix, n) {
  const phaseFactor = divide(1, sqrt(det(targetMatrix)))
  const inputSequence = GateSequence.fromsu2Matrix(multiply(phaseFactor, targetMatrix))
  // const globalPhase = atan2(phaseFactor.im, phaseFactor.re)

  const resSequence = solovayKitaev(inputSequence, n)
  resSequence.clean()
  return resSequence
}

/**
 * The recursive function in the Solovay-Kitaev algorithm.
 * @param {GateSequence} u The gate to be approximated
 * @param {Number} n recursion depth
 * @returns {GateSequence} Approximation of u
 */
function solovayKitaev(u, n) {
  if (n === 0) {
    return findClosestBasicApproximation(u)
  }
  const uApprox = solovayKitaev(u, n - 1)
  const delta = u.dot(uApprox.adjoint())

  const [v, w] = balancedCommutatorDecomposition(delta.product)

  const vApprox = solovayKitaev(v, n - 1)
  const wApprox = solovayKitaev(w, n - 1)

  return vApprox.dot(wApprox).dot(vApprox.adjoint()).dot(wApprox.adjoint()).dot(uApprox)
}

/**
 * Finds the closest basic approximation to the given GateSequence by the Frobenius norm
 * of the matrices' difference.
 * @param {GateSequence} target Sequence to find the approximation for
 * @returns {GateSequence} Sequence closest to target
 */
function findClosestBasicApproximation(target) {
  const targetMatrix = target.product
  let minLoss = Infinity
  let minLossApprox
  for (const approx of basicApproximations) {
    const sequenceMatrix = matrix(approx.matrix)
    const loss = norm(subtract(sequenceMatrix, targetMatrix), 'fro')
    if (loss < minLoss) {
      minLoss = loss
      minLossApprox = approx
    }
  }
  const minLossSequence = GateSequence.fromso3Matrix(matrix(minLossApprox.matrix))
  minLossSequence.gates = minLossApprox.names
  return minLossSequence
}

/**
 * Creates an SO(3) matrix from the given parameters.
 * Taken from https://www.mathworks.com/help/nav/ref/so3.html
 * @param {string} axis "x" or "y"
 * @param {Number} angle in radians
 * @returns {Matrix} SO(3) representing +angle rotations around given axis
 */
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

/**
 * Finds the rotation axis of an SO(3) matrix.
 * @param {Matrix} so3Matrix SO(3) matrix to find the axis of
 * @returns {Number[3]} Array in xyz order of the axis of rotation.
 */
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

/**
 * Finds the SO(3) matrix to rotate from `from` to `to`.
 * @param {Number[]} from unit vector of size 3
 * @param {Number[]} to unit vector of size 3
 * @returns {Matrix}
 */
function computeRotationBetween(from, to) {
  const fromVec = divide(from, norm(from, 'fro'))
  const toVec = divide(to, norm(to, 'fro'))

  const dotProduct = dot(fromVec, toVec)
  const crossProduct = crossProductMatrix(cross(fromVec, toVec))
  const crossDot = multiply(crossProduct, crossProduct)
  return add(add(identity(3), crossProduct), divide(crossDot, 1 + dotProduct))
}

/**
 * Computes cross product matrix from vector.
 * @param {Number[3]} vec cross product vector
 * @returns {Matrix} 3x3 matrix of the cross product.
 */
function crossProductMatrix(vec) {
  return matrix([
    [0, -1 * vec[2], vec[1]],
    [vec[2], 0, -1 * vec[0]],
    [-1 * vec[1], vec[0], 0]
  ])
}

/**
 * Computes a balanced commutator decomposition as described in the papers.
 * @param {matrix} so3Matrix SO(3) matrix to decompose.
 * @returns {GateSequence[2]} v, w such that v w vdg wdg = U
 */
function balancedCommutatorDecomposition(so3Matrix) {
  // rotation angle of so3Matrix
  const angleTheta = acos((trace(so3Matrix) - 1) / 2)
  // rotation angles for vTilde and wTilde
  const anglePhi = 2 * asin(nthRoot((1 - cos(angleTheta / 2)) / 2, 4))
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

  const v = multiply(multiply(simMatrix, vTilde), simMatrixdg)
  const w = multiply(multiply(simMatrix, wTilde), simMatrixdg)

  return [GateSequence.fromso3Matrix(v), GateSequence.fromso3Matrix(w)]
}
