<template>
  <h1>Custom Gate</h1>
  <p>
    It is possible to approximate any rotation on the Bloch sphere using just the H and T gates.
    This was proven in the
    <a href="https://en.wikipedia.org/wiki/Solovay%E2%80%93Kitaev_theorem" target="_blank"
      >Solovay–Kitaev theorem</a
    >, which also states that this approximation can be found efficiently.
  </p>
  <p>
    Using this tool, you can select two points on the Bloch sphere to attempt to rotate between, and
    find this approximation.
  </p>
  <ol>
    <li>Click on any point of the Bloch sphere to select |α⟩.</li>
    <li>
      Click on the button labeled "Set |β⟩" and then click on any point of the Bloch sphere to
      select |β⟩.
    </li>
    <li>Select desired precision for the approximation, and click "Calculate".</li>
  </ol>
</template>
