import { matrix, divide, sqrt } from 'mathjs'
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
    console.log('basicApproximations', basicApproximations)
    console.log('basicApproximations[0]', basicApproximations[0])
  }
}

// function findClosestBasicApproximation(target) {
//   const targetMatrix = target.product;

// }
