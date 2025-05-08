const gridContainer = document.getElementById('grid');

const cellSize = 100;
const size = 3;

// Crear planos: XY, YZ, XZ
const createPlane = (axisClass) => {
  const plane = document.createElement('div');
  plane.className = `plane ${axisClass}`;

  const isXY = axisClass === 'xy';
  const isYZ = axisClass === 'yz';
  const isXZ = axisClass === 'xz';

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'plane-cell';

    switch (true) {
      case isXY:
        cell.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Rojo
        break;
      case isYZ:
        cell.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Verde
        break;
      case isXZ:
        cell.style.backgroundColor = 'rgba(0, 0, 255, 0.5)'; // Azul
        break;
    }

    plane.appendChild(cell);
  }

  gridContainer.appendChild(plane);
};

createPlane('xy');
createPlane('yz');
createPlane('xz');

// Hover Cube
const hoverCube = document.createElement('div');
hoverCube.className = 'hover-cube';
gridContainer.appendChild(hoverCube);

// Cubos fijos
const cubes = [];

const getCellPosition = (mouseX, mouseY) => {
  const rect = gridContainer.getBoundingClientRect();
  const x = Math.floor((mouseX - rect.left) / cellSize);

  // Invertir Y visualmente
  const relativeY = mouseY - rect.top;
  const invertedY = rect.height - relativeY;
  const y = Math.floor(invertedY / cellSize);

  // Aquí calculamos la posición z basándonos en la altura de la cuadrícula
  const z = Math.floor((mouseY - rect.top) / cellSize);  // O cualquier lógica que quieras usar para calcular Z.

  if (x >= 0 && x < size && y >= 0 && y < size) {
    return { x, y, z };  // Asegúrate de devolver también z
  }
  return null;
};

// Mover cubo hover con el mouse
gridContainer.addEventListener('mousemove', (e) => {
  const pos = getCellPosition(e.clientX, e.clientY);
  if (pos) {
    const { x, y } = pos; // ya no tomamos z desde aquí

    // Calcular la siguiente capa libre (nextZ) en (x, y)
    const columnCubes = cubes
      .filter(cubeKey => {
        const [cx, cy] = cubeKey.split('-').map(Number);
        return cx === x && cy === y;
      })
      .map(cubeKey => parseInt(cubeKey.split('-')[2]));

    const maxZ = columnCubes.length > 0 ? Math.max(...columnCubes) : -1;
    const nextZ = maxZ + 1;

    // Mostrar solo el hoverCube en esa posición (x, y, nextZ)
    hoverCube.style.display = 'block';
    hoverCube.style.transform = `translate3d(${x * cellSize}px, ${y * cellSize}px, ${-(nextZ * cellSize)}px)`;  
    hoverCube.dataset.x = x;
    hoverCube.dataset.y = y;
    hoverCube.dataset.z = nextZ;
  } else {
    hoverCube.style.display = 'none';
  }
});


// Colocar cubo fijo al hacer click
gridContainer.addEventListener('click', (e) => {
  if (!hoverCube.style.display || hoverCube.style.display === 'none') return;

  const x = parseInt(hoverCube.dataset.x);
  const y = parseInt(hoverCube.dataset.y);
  let z = parseInt(hoverCube.dataset.z);

  // Verificar si ya existe un cubo en esa posición
  const key = `${x}-${y}-${z}`;
  
  // Verificar si ya hay un cubo en la posición
  if (cubes.includes(key)) {
    return; // No permitir crear un cubo en una posición ocupada
  }

  // Verificar si el cubo que queremos colocar tiene un cubo debajo de él (Z-1)
  if (z > 0) { // Si estamos intentando colocar un cubo en Z > 0
    const belowKey = `${x}-${y}-${z - 1}`;
    if (!cubes.includes(belowKey)) {
      return; // No podemos colocar el cubo sin un cubo debajo
    }
  }

  cubes.push(key); // Agregar la posición del cubo

  // Crear nuevo cubo
  const cube = document.createElement('div');
  cube.className = 'cube';
  cube.style.transform = `translate3d(${x * cellSize}px, ${y * cellSize}px, ${-(z * cellSize / 2)}px)`;

  // Crear caras del cubo
  const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  for (const name of faceNames) {
    const face = document.createElement('div');
    face.className = `face ${name}`;
    cube.appendChild(face);
  }

  gridContainer.appendChild(cube);

  // Si el cubo ya tiene caras, agregar la lógica de apilamiento
  if (e.target.classList.contains('face')) {
    const clickedFace = getClickedFace(e, cube);
    
    // Dependiendo de la cara clickeada, se incrementa el valor de z para apilar el cubo
    switch (clickedFace) {
      case 'front':
        z += 1; // Apilar hacia adelante
        break;
      case 'back':
        z -= 1; // Apilar hacia atrás
        break;
      case 'left':
        z -= 1; // Apilar hacia la izquierda
        break;
      case 'right':
        z += 1; // Apilar hacia la derecha
        break;
      case 'top':
        z += 1; // Apilar hacia arriba
        break;
      case 'bottom':
        z -= 1; // Apilar hacia abajo
        break;
    }
  }

  // Actualizar la posición z del cubo cuando el apilamiento está activado
  cube.style.transform = `translate3d(${x * cellSize}px, ${y * cellSize}px, ${-(z * cellSize + 50)}px)`;
});

// Colocar cubo fijo al hacer click
gridContainer.addEventListener('click', (e) => {
  if (!hoverCube.style.display || hoverCube.style.display === 'none') return;

  const x = parseInt(hoverCube.dataset.x);
  const y = parseInt(hoverCube.dataset.y);
  let z = parseInt(hoverCube.dataset.z);

  // Verificar si ya existe un cubo en esa posición
  const key = `${x}-${y}-${z}`;
  
  // Verificar si ya hay un cubo en la posicióna
  if (cubes.includes(key)) {
    return; // No permitir crear un cubo en una posición ocupada
  }

  // Verificar si el cubo que queremos colocar tiene un cubo debajo de él (Z-1)
  if (z > 0) { // Si estamos intentando colocar un cubo en Z > 0
    const belowKey = `${x}-${y}-${z - 1}`;
    if (!cubes.includes(belowKey)) {
      return; // No podemos colocar el cubo sin un cubo debajo
    }
  }

  cubes.push(key); // Agregar la posición del cubo

  // Crear nuevo cubo
  const cube = document.createElement('div');
  cube.className = 'cube';
  cube.style.transform = `translate3d(${x * cellSize}px, ${y * cellSize}px, ${-(z * cellSize / 2)}px)`;

  // Crear caras del cubo
  const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  for (const name of faceNames) {
    const face = document.createElement('div');
    face.className = `face ${name}`;
    cube.appendChild(face);
  }

  gridContainer.appendChild(cube);

  // Si el cubo ya tiene caras, agregar la lógica de apilamiento
  if (e.target.classList.contains('face')) {
    const clickedFace = getClickedFace(e, cube);
    
    // Dependiendo de la cara clickeada, se incrementa el valor de z para apilar el cubo
    switch (clickedFace) {
      case 'front':
        z += 1; // Apilar hacia adelante
        break;
      case 'back':
        z -= 1; // Apilar hacia atrás
        break;
      case 'left':
        z -= 1; // Apilar hacia la izquierda
        break;
      case 'right':
        z += 1; // Apilar hacia la derecha
        break;
      case 'top':
        z += 1; // Apilar hacia arriba
        break;
      case 'bottom':
        z -= 1; // Apilar hacia abajo
        break;
    }
  }

  // Actualizar la posición z del cubo cuando el apilamiento está activado
  cube.style.transform = `translate3d(${x * cellSize}px, ${y * cellSize}px, ${-(z * cellSize + 50)}px)`;
});


// Colocar cubo fijo al hacer click
// Función para detectar la cara clickeada
const getClickedFace = (event, cubeElement) => {
  const cubeRect = cubeElement.getBoundingClientRect();
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  for (const name of faceNames) {
    const face = cubeElement.querySelector(`.face.${name}`);
    const faceRect = face.getBoundingClientRect();

    // Verificar si el clic ocurrió dentro de la cara
    if (mouseX >= faceRect.left && mouseX <= faceRect.right &&
        mouseY >= faceRect.top && mouseY <= faceRect.bottom) {
      return name; // Retorna el nombre de la cara clickeada
    }
  }

  return null; // No se hizo clic en ninguna cara
};

// Colocar cubo fijo al hacer click
gridContainer.addEventListener('click', (e) => {
  if (!hoverCube.style.display || hoverCube.style.display === 'none') return;

  const x = parseInt(hoverCube.dataset.x);
  const y = parseInt(hoverCube.dataset.y);
  let z = parseInt(hoverCube.dataset.z);

  // Verificar si ya existe un cubo en esa posición
  const key = `${x}-${y}-${z}`;
  
  // Verificar si ya hay un cubo en la posición
  if (cubes.includes(key)) {
    return; // No permitir crear un cubo en una posición ocupada
  }

  // Verificar si el cubo que queremos colocar tiene un cubo debajo de él (Z-1)
  if (z > 0) { // Si estamos intentando colocar un cubo en Z > 0
    const belowKey = `${x}-${y}-${z - 1}`;
    if (!cubes.includes(belowKey)) {
      return; // No podemos colocar el cubo sin un cubo debajo
    }
  }

  cubes.push(key); // Agregar la posición del cubo

  // Crear nuevo cubo
  const cube = document.createElement('div');
  cube.className = 'cube';
  cube.style.transform = `translate3d(${x * cellSize}px, ${y * cellSize}px, ${-(z * cellSize / 2)}px)`;

  // Crear caras del cubo
  const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  for (const name of faceNames) {
    const face = document.createElement('div');
    face.className = `face ${name}`;
    cube.appendChild(face);
  }

  gridContainer.appendChild(cube);

  // Si el cubo ya tiene caras, agregar la lógica de apilamiento
  if (e.target.classList.contains('face')) {
    const clickedFace = getClickedFace(e, cube);
    
    // Dependiendo de la cara clickeada, se incrementa el valor de z para apilar el cubo
    switch (clickedFace) {
      case 'front':
        z += 1; // Apilar hacia adelante
        break;
      case 'back':
        z -= 1; // Apilar hacia atrás
        break;
      case 'left':
        z -= 1; // Apilar hacia la izquierda
        break;
      case 'right':
        z += 1; // Apilar hacia la derecha
        break;
      case 'top':
        z += 1; // Apilar hacia arriba
        break;
      case 'bottom':
        z -= 1; // Apilar hacia abajo
        break;
    }
  }

  // Actualizar la posición z del cubo cuando el apilamiento está activado
  cube.style.transform = `translate3d(${x * cellSize}px, ${y * cellSize}px, ${-(z * cellSize + 50)}px)`;
});

const createAxis = (axis, length, color, label) => {
  const line = document.createElement('div');
  line.className = 'axis';
  line.style.background = color;

  const labelEl = document.createElement('div');
  labelEl.className = 'axis-label';
  labelEl.textContent = label;
  labelEl.style.color = color;

  if (axis === 'x') {
    line.style.width = `${length * 4}px`;
    line.style.height = '2px';
    line.style.transform = `translate3d(0px, 0px, 0px)`;
    labelEl.style.transform = `translate3d(${(length + 5) * 4}px, 0px, 0px)`;
  } else if (axis === 'y') {
    line.style.height = `${length * 4}px`;
    line.style.width = '2px';
    line.style.transform = `translate3d(0px, 0px, 0px)`;
    labelEl.style.transform = `rotateX(180deg) translate3d(0px, ${(length - 205) * 4}px, 0px)`;
  } else if (axis === 'z') {
    line.style.width = `${length * 4}px`;
    line.style.height = '2px';
    line.style.transform = `rotateY(90deg) translate3d(0px, 0px, 0px)`;
    labelEl.style.transform = `rotateY(0deg) translate3d(${(length + 5) * 4}px, 0px, 0px)`;
  }

  line.appendChild(labelEl);
  gridContainer.appendChild(line);
};

// Crear ejes desde el origen en dirección positiva
createAxis('x', 100, 'red', 'X');
createAxis('y', 100, 'green', 'Y');
createAxis('z', 100, 'blue', 'Z');

let isDragging = false;
let lastX, lastY;
let rotationX = 180;
let rotationY = 20;
let rotationZ = 0;

gridContainer.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(0deg)`;

// Iniciar arrastre
gridContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

// Finalizar arrastre
document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Movimiento del mouse
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const deltaX = e.clientX - lastX;
  const deltaY = e.clientY - lastY;

  // Ajustar sensibilidad si querés
  rotationY += deltaX * 0.5;
  rotationX += deltaY * 0.5;

  // Limitar rotación X para que no se voltee del todo si no querés
  rotationX = Math.max(90, Math.min(270, rotationX)); // evita que Y se invierta

  gridContainer.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;

  lastX = e.clientX;
  lastY = e.clientY;
});