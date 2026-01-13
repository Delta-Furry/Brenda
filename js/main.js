import * as THREE from 'three'; 
import { OrbitControls } from './OrbitControls.js';
import { Tween, Easing, update as updateTween } from 'tween';
import { GLTFLoader } from './GLTFLoader.js'; 
import { FontLoader } from './FontLoader.js'; 
import { TextGeometry } from './TextGeometry.js';
import { cargarHabitacion } from './Habitacion.js';
import { cargarPresentacion, cambiarDiapositiva } from './Presentacion.js';
import { cargarContacto } from './Contacto.js';

// --- 1. CONFIGURACIÓN BÁSICA ---
const scene = new THREE.Scene();

scene.background = new THREE.Color(0x221133); // Fondo morado atardecer
scene.fog = new THREE.FogExp2(0x221133, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 2. ILUMINACIÓN ---
const ambientLight = new THREE.AmbientLight(0xffaa55, 0.2); 
scene.add(ambientLight);

const sol = new THREE.DirectionalLight(0xffddaa, 0.6); 
sol.position.set(5, 10, 8);
sol.castShadow = true;
scene.add(sol);

const focoInterior = new THREE.PointLight(0xffffff, 0.4, 10); 
focoInterior.position.set(0, 2, 0);
scene.add(focoInterior);

// --- 3. TEXTURAS Y MATERIALES ---
const textureLoader = new THREE.TextureLoader();
const texPiso = textureLoader.load('./assets/textures/t_piso.jpg');
texPiso.wrapS = texPiso.wrapT = THREE.RepeatWrapping; texPiso.repeat.set(4, 4);
const texFondo = textureLoader.load('./assets/textures/t_fondo.jpg');
const texTecho = textureLoader.load('./assets/textures/t_techo.jpg');
const texMesa = textureLoader.load('./assets/textures/t_mesa.jpg');
// ... (después de texMesa) ...
const texPared = textureLoader.load('./assets/textures/t_pared.jpg'); // <--- AGREGAR ESTO

// ... (en la zona de materiales) ...
const matPared = new THREE.MeshStandardMaterial({ map: texPared, side: THREE.DoubleSide }); // <--- AGREGAR ESTO



const matPiso = new THREE.MeshStandardMaterial({ map: texPiso, roughness: 0.9, color: 0x999999 });
const matMesa = new THREE.MeshStandardMaterial({ map: texMesa, roughness: 0.8 });
const matLona = new THREE.MeshStandardMaterial({ map: texTecho, side: THREE.DoubleSide });
const matMetal = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7 });

// --- 4. CONSTRUCCIÓN DEL PUESTO (TIANGUIS V3.0) ---
const tianguisGroup = new THREE.Group();
// --- PARED DE FONDO (Lona atrás de la reja) ---
const geomPared = new THREE.BoxGeometry(10, 4, 0.1);
const paredFondo = new THREE.Mesh(geomPared, matPared);
// --- PAREDES LATERALES ---
const geomLat = new THREE.BoxGeometry(0.1, 4, 2.5);
const paredIzq = new THREE.Mesh(geomLat, matPared);
paredIzq.position.set(-4.9, 1.5, -1.25); // Detrás de reja izquierda
tianguisGroup.add(paredIzq);

const paredDer = new THREE.Mesh(geomLat, matPared);
paredDer.position.set(4.9, 1.5, -1.25); // Detrás de reja derecha
tianguisGroup.add(paredDer);
// La ponemos un poquito atrás de la reja trasera (que está en -2.5)
paredFondo.position.set(0, 1.5, -2.6); 
tianguisGroup.add(paredFondo);
// Suelo y Mesa
const suelo = new THREE.Mesh(new THREE.BoxGeometry(25, 0.2, 25), matPiso);
suelo.position.y = -1.1; suelo.receiveShadow = true;
tianguisGroup.add(suelo);

const mesa = new THREE.Mesh(new THREE.BoxGeometry(9, 0.8, 2.5), matMesa);
mesa.position.set(0, -0.4, 0); mesa.castShadow = true; mesa.receiveShadow = true;
tianguisGroup.add(mesa);

// Postes y Techo
const tuboGeo = new THREE.CylinderGeometry(0.08, 0.08, 5);
const tuboMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.5 });
[[-4.8, -2.5], [4.8, -2.5], [-4.8, 2], [4.8, 2]].forEach(pos => {
    const p = new THREE.Mesh(tuboGeo, tuboMat);
    p.position.set(pos[0], 1.5, pos[1]);
    tianguisGroup.add(p);
});

const techo = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 6), matLona);
techo.position.set(0, 4.2, -0.2); techo.rotation.x = Math.PI/2 + 0.2;
tianguisGroup.add(techo);

// Función para crear Rejas
function crearReja(w, h, niveles) {
    const g = new THREE.Group();
    const poste = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, 0.05), matMetal);
    const p1 = poste.clone(); p1.position.set(-w/2, h/2, 0);
    const p2 = poste.clone(); p2.position.set(w/2, h/2, 0);
    g.add(p1, p2);

    for(let i=1; i<=niveles; i++) {
        const barra = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, 0.02), matMetal);
        barra.position.y = (h/(niveles+1)) * i;
        g.add(barra);
    }
    return g;
}

// Instalación de Rejas
const rejaFondo = crearReja(9.5, 4, 6); rejaFondo.position.set(0, 0, -2.5); tianguisGroup.add(rejaFondo);
const rejaIzq = crearReja(4.5, 4, 6); rejaIzq.rotation.y = Math.PI/2; rejaIzq.position.set(-4.8, 0, -0.25); tianguisGroup.add(rejaIzq);
const rejaDer = crearReja(4.5, 4, 6); rejaDer.rotation.y = -Math.PI/2; rejaDer.position.set(4.8, 0, -0.25); tianguisGroup.add(rejaDer);

// Función Gorra Decorativa (Low Poly)
function crearGorraStock(color) {
    const g = new THREE.Group();
    g.scale.set(1.2, 1.2, 1.2);
    const mat = new THREE.MeshStandardMaterial({ color: color, flatShading: true });
    const corona = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.2, 8), mat);
    corona.position.y = 0.1; corona.rotation.x = 0.2;
    const visera = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.3), mat);
    visera.position.set(0, 0.05, 0.25);
    g.add(corona, visera);
    return g;
}

// Llenar estantes
const colores = [0x111111, 0x990000, 0x003388, 0xFFFFFF, 0x225522, 0xFFA500];
const alturas = [0.6, 1.2, 1.8, 2.4, 3.0, 3.6];




alturas.forEach(h => {
    // Fondo
    for(let i=0; i<7; i++) {
        const g = crearGorraStock(colores[Math.floor(Math.random()*colores.length)]);
        g.position.set((i*1.3)-3.9, h-0.05, -2.3); g.rotation.y = (Math.random()-0.5)*0.3;
        tianguisGroup.add(g);
    }
    // Lados (solo niveles bajos)
    if(h < 2.5) {
        for(let i=0; i<4; i++) {
            const c = colores[Math.floor(Math.random()*colores.length)];
            const gL = crearGorraStock(c); gL.position.set(-4.6, h-0.05, (i*1)-1.5); gL.rotation.y = Math.PI/2;
            const gR = crearGorraStock(c); gR.position.set(4.6, h-0.05, (i*1)-1.5); gR.rotation.y = -Math.PI/2;
            tianguisGroup.add(gL, gR);
        }
    }
});







scene.add(tianguisGroup);




// ==========================================
// --- 3 PAREDES LATERALES (CÓDIGO CORREGIDO) ---
// ==========================================

// 1. Cargar las 3 texturas (Nombres nuevos para no repetir)
const texCieloAtras = textureLoader.load('./assets/textures/cielo.jpg');
const texCieloIzq = textureLoader.load('./assets/textures/cielo2.jpg');
const texCieloDer = textureLoader.load('./assets/textures/cielo3.jpg');

// 2. Crear materiales
const matCieloAtras = new THREE.MeshBasicMaterial({ map: texCieloAtras, side: THREE.DoubleSide });
const matCieloIzq = new THREE.MeshBasicMaterial({ map: texCieloIzq, side: THREE.DoubleSide });
const matCieloDer = new THREE.MeshBasicMaterial({ map: texCieloDer, side: THREE.DoubleSide });

// 3. Geometría
const geoCielo = new THREE.PlaneGeometry(25, 15); 

// --- PARED IZQUIERDA ---
const muroIzq = new THREE.Mesh(geoCielo, matCieloIzq);
muroIzq.position.set(-12.5, 6, 0); 
muroIzq.rotation.y = Math.PI / 2;
scene.add(muroIzq);

// --- PARED DERECHA ---
const muroDer = new THREE.Mesh(geoCielo, matCieloDer);
muroDer.position.set(12.5, 6, 0); 
muroDer.rotation.y = -Math.PI / 2;
scene.add(muroDer);

// --- PARED DE ATRÁS ---
const muroAtras = new THREE.Mesh(geoCielo, matCieloAtras);
muroAtras.position.set(0, 6, -12.5);
scene.add(muroAtras);




// --- 5. LOGICA INTERACTIVA ---
const interactables = [];
const loader = new GLTFLoader();




function cargarGorraMenu(x, nombre) {
    loader.load('./modelos/gorra.glb', (gltf) => {
        const m = gltf.scene; 
        
        // --- AQUÍ CÁMBIALE EL TAMAÑO ---
        // Estaba en 0.15. Si está enorme, prueba con 0.05 o 0.02
        m.scale.set(0.004, 0.004, 0.004); 
        
        m.position.set(x, 0.5, 0); 
        m.name = nombre;
        // ... resto del código
        m.traverse(c => { if(c.isMesh) { c.castShadow = true; c.name = nombre; }});
        scene.add(m); interactables.push(m);
        
        function anim() { requestAnimationFrame(anim); m.rotation.y += 0.005; } anim();
    });
}
cargarGorraMenu(-3, "gorra_quien_soy");
cargarGorraMenu(0, "gorra_proyectos");
cargarGorraMenu(3, "gorra_contacto");

// Letreros
const fontLoader = new FontLoader();
function letrero(txt, x) {
    fontLoader.load('./font/helvetiker.json', (font) => {
        const geo = new TextGeometry(txt, { font: font, size: 0.3, height: 0.05 }); geo.center();
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        mesh.position.set(x, 1.2, 0); scene.add(mesh);
        let t=0; function anim() { requestAnimationFrame(anim); t+=0.02; mesh.position.y = 1.2 + Math.sin(t)*0.05; } anim();
    });
}
letrero("PROYECTOS", -3); letrero("SOBRE MI", 0); letrero("CONTACTO", 3);

// Cargar Escenarios
cargarHabitacion(scene, loader, interactables);
cargarPresentacion(scene, interactables); 
cargarContacto(scene, interactables);

// Eventos Mouse y Vuelo
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function volarA(x, y, z, look) {
    const from = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    new Tween(from).to({x, y, z}, 1500).easing(Easing.Cubic.InOut)
        .onUpdate(() => {
            camera.position.set(from.x, from.y, from.z);
            if(look) { camera.lookAt(look.x, look.y, look.z); controls.target.set(look.x, look.y, look.z); }
        }).start();
}

window.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(interactables, true);
    
    if(hits.length > 0) {
        let obj = hits[0].object;
        while(obj.parent && !obj.name && obj.parent.type !== 'Scene') obj = obj.parent;
        
        if(obj.name === "gorra_quien_soy") volarA(-100, 2, -5, {x:-100, y:2, z:0});
        else if(obj.name === "gorra_proyectos") volarA(0, -98.5, 12, {x:0, y:-96, z:0});
        else if(obj.name === "gorra_contacto") volarA(200, 0, 14, {x:200, y:0, z:0});
        else if(obj.name === "boton_regresar" || obj.name === "btn_presentacion_salir" || obj.name === "btn_contacto_salir") volarA(0, 2, 6, {x:0, y:0, z:0});
        
        // Controles extra
        else if(obj.name === "btn_presentacion_siguiente") cambiarDiapositiva(1);
        else if(obj.name === "btn_presentacion_anterior") cambiarDiapositiva(-1);
   // ... (después de los otros else if) ...

    // ... (código que ya tienes del botón ver galería) ...
        else if(obj.name === "boton_ver_galeria") {
            console.log("¡Click detectado en Ver Galería!");
            volarA(-100, 2, 0, {x: -100, y: 2, z: -10}); 
        } 
        
        // 👇👇👇 ¡AQUÍ! PEGA ESTO JUSTO AQUÍ 👇👇👇

        else if(obj.name.includes("flecha_")) {
            console.log("¡Click en flecha detectado!");

            // Efecto rebote visual
            new Tween(obj.scale).to({x: 1.5, y: 1.5}, 100).yoyo(true).repeat(1).start();

            // Matemática para sumar o restar pared
            if (obj.name.includes("siguiente")) {
                paredActual++;
                if(paredActual > 3) paredActual = 0;
            } 
            else if (obj.name.includes("anterior")) {
                paredActual--;
                if(paredActual < 0) paredActual = 3;
            }

            // Llamamos a la función que pegaste al final
            girarCamara(paredActual);
        }

        // 👆👆👆 FIN DE LO QUE TIENES QUE PEGAR 👆👆👆
   
    }
});

// Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    updateTween(); 
    renderer.render(scene, camera);
}
animate();
// =====================================================
// --- PEGA ESTO AL FINAL DE TU ARCHIVO main.js ---
// =====================================================

// Variable para saber qué pared miramos (0=Frente, 1=Der, 2=Atrás, 3=Izq)
let paredActual = 0; 

function girarCamara(pared) {
    console.log("Girando a pared: " + pared);
    
    // Siempre giramos desde el centro (-100, 2, 0)
    let mirarHacia = { x: -100, y: 2, z: 0 }; 

    if(pared === 0) { mirarHacia.x = -100; mirarHacia.z = -10; } // Frente
    if(pared === 1) { mirarHacia.x = -90;  mirarHacia.z = 0;   } // Derecha
    if(pared === 2) { mirarHacia.x = -100; mirarHacia.z = 10;  } // Atrás
    if(pared === 3) { mirarHacia.x = -110; mirarHacia.z = 0;   } // Izquierda

    // Usamos Tween para girar suave
    new Tween(controls.target)
        .to(mirarHacia, 1500)
        .easing(Easing.Cubic.InOut)
        .start();
}



window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
