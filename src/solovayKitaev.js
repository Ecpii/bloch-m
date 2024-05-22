import { matrix, divide, sqrt, subtract, norm } from 'mathjs'
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
}

export function solovayKitaev(target, n) {
  if (n === 0) {
    return findClosestBasicApproximation(target)
  }
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
