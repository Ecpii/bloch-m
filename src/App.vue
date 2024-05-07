<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Line2 } from '@tresjs/cientos'

// const scene = new THREE.Scene()
// const camera = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000)
// camera.position.set(2, 0, 0)
// camera.lookAt(0, 0, 0)
// camera.rotation.z += Math.PI / 2
// camera.rotation.y -= Math.PI / 2.5 - Math.PI / 2
// // camera.setRotationFromAxisAngle(THREE.Vector3(0, 0, 1), Math.PI / 2)

// onMounted(() => {
//   if (!WebGL.isWebGLAvailable()) {
//     const warning = WebGL.getWebGLErrorMessage()
//     threeMountPoint.value.innerText = warning
//     return
//   }

//   const renderer = new THREE.WebGLRenderer({ alpha: true })
//   renderer.setSize(width, height)
//   function animate() {
//     requestAnimationFrame(animate)
//     sphere.rotation.x += 0.01
//     sphere.rotation.y += 0.01
//     renderer.render(scene, camera)
//   }
//   threeMountPoint.value.appendChild(renderer.domElement)
//   animate()
// })

// const geometry = new THREE.SphereGeometry(1)
// const material = new THREE.MeshBasicMaterial({ color: 0x7b97f9, transparent: true, opacity: 0.4 })
// const sphere = new THREE.Mesh(geometry, material)
// // scene.add(sphere)

// let lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 5 })
// let points = [new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 1)]
// let lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
// const zAxis = new THREE.Line(lineGeometry, lineMaterial)
// // line.computeLineDistances()
// scene.add(zAxis)

// lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 5 })
// points = [new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0)]
// lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
// const yAxis = new THREE.Line(lineGeometry, lineMaterial)
// scene.add(yAxis)

// lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 5 })
// points = [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)]
// lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
// const xAxis = new THREE.Line(lineGeometry, lineMaterial)
// scene.add(xAxis)
</script>

<template>
  <header>
    <h1>Bloch M</h1>
  </header>

  <main>
    <div id="tres-canvas">
      <TresCanvas :alpha="true">
        <TresPerspectiveCamera :up="[0, 0, 1]" :position="[2, 1, 1]" :look-at="[0, 0, 0]" />
        <OrbitControls />
        <TresMesh>
          <TresSphereGeometry :args="[1]" />
          <TresMeshBasicMaterial :color="0x7b97f9" :transparent="true" :opacity="0.4" />
        </TresMesh>
        <!-- <TresAxesHelper /> -->
        <Line2
          :points="[
            [-1, 0, 0],
            [1, 0, 0]
          ]"
          :line-width="10"
          color="#ff0000"
        />
        <Line2
          :points="[
            [0, -1, 0],
            [0, 1, 0]
          ]"
          :line-width="10"
          color="#00ff00"
        />
        <Line2
          :points="[
            [0, 0, -1],
            [0, 0, 1]
          ]"
          :line-width="10"
          color="#0000ff"
        />
      </TresCanvas>
    </div>
  </main>
</template>

<style scoped>
h1 {
  font-weight: bold;
}
#tres-canvas {
  width: 1280px;
  height: 720px;
}
</style>
