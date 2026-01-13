import * as THREE from 'three';
import { FontLoader } from './FontLoader.js';
import { TextGeometry } from './TextGeometry.js';

// ==========================================
// --- 1. CONFIGURACIÓN DEL VIDEO (NUEVO) ---
// ==========================================
const video = document.createElement('video');
video.src = './assets/textures/v1.mp4'; // <--- Aquí cargamos tu video v1.mp4
video.crossOrigin = 'anonymous';
video.loop = true;
video.muted = true; // Silencio para que arranque solo
video.play(); 

// Creamos la textura de video para Three.js
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.colorSpace = THREE.SRGBColorSpace; 

// ==========================================
// --- 2. MATERIALES (MODIFICADO) ---
// ==========================================
const matPiso = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1, metalness: 0.5 });

// 👇 AQUÍ ESTÁ EL CAMBIO CLAVE: Usamos 'map: videoTexture' en lugar de 'color'
const matPantalla = new THREE.MeshBasicMaterial({ 
    map: videoTexture, 
    side: THREE.DoubleSide 
});

const matConsola = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 0.8 });
const matBotonSig = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Verde
const matBotonAnt = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Rojo
const matNeonAzul = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const matNeonRosa = new THREE.MeshBasicMaterial({ color: 0xff00ff });
const matTextoBotones = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Texto Blanco
let diapositivaActual = 0;
const totalDiapositivas = 5;
let grupoContenido; 
export function cargarPresentacion(scene, interactables) {
    const escenario = new THREE.Group();
    escenario.position.set(0, -100, 0); 

    // --- 1. EL ESCENARIO MEJORADO ---
    
    // A. Piso Sólido (Base oscura)
    const piso = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 0.5, 32), matPiso);
    piso.position.y = -0.25;
    escenario.add(piso);

    // B. PISO DE RED NEÓN (GRID TRON) ¡NUEVO! ✨
    // Una red gigante brillante en el suelo
    const gridHelper = new THREE.GridHelper(30, 30, 0x00ffff, 0x222222);
    gridHelper.position.y = 0.01; // Apenas encima del piso
    escenario.add(gridHelper);

    // C. Pantalla Curva Gigante
    const geoPantalla = new THREE.CylinderGeometry(12, 12, 8, 32, 1, true, Math.PI + 0.5, Math.PI - 1);
    const pantalla = new THREE.Mesh(geoPantalla, matPantalla);
    pantalla.position.y = 4;
    pantalla.scale.x = -1; 
    escenario.add(pantalla);

    // D. Marcos de Neón (Arriba y Abajo)
    const marcoSup = new THREE.Mesh(new THREE.TorusGeometry(12, 0.1, 16, 100, Math.PI - 1), matNeonAzul);
    marcoSup.position.y = 8;
    marcoSup.rotation.x = Math.PI / 2;
    marcoSup.rotation.z = Math.PI / 2 + 0.5;
    escenario.add(marcoSup);
    
    const marcoInf = marcoSup.clone();
    marcoInf.position.y = 0.1; // Marco en el suelo también
    escenario.add(marcoInf);

    // --- 2. DECORACIÓN FLOTANTE (RELLENO) ¡NUEVO! ✨ ---

    // A. Partículas (Polvo de datos flotando)
    const partGeo = new THREE.BufferGeometry();
    const partCount = 200;
    const posArray = new Float32Array(partCount * 3);
    for(let i=0; i < partCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 25; // Esparcidas en 25 metros
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const partMat = new THREE.PointsMaterial({
        size: 0.05, 
        color: 0x00ffff, 
        transparent: true, 
        opacity: 0.6
    });
    const particulas = new THREE.Points(partGeo, partMat);
    particulas.position.y = 5; // Flotando en el aire
    escenario.add(particulas);

    // Animación de partículas (suben y bajan suavemente)
    const animarParticulas = () => {
        requestAnimationFrame(animarParticulas);
        particulas.rotation.y += 0.001; // Giran lento
        // Efecto de respiración
        particulas.position.y = 5 + Math.sin(Date.now() * 0.0005); 
    };
    animarParticulas();

    // B. Pantallas Verticales Laterales (Para que no se vea vacío a los lados)
    const geoSideScreen = new THREE.BoxGeometry(2, 6, 0.2);
    const matSideScreen = new THREE.MeshBasicMaterial({ color: 0x111111 }); // Oscuras con borde

    // Izquierda
    const sideL = new THREE.Mesh(geoSideScreen, matSideScreen);
    sideL.position.set(-8, 3, 5);
    sideL.rotation.y = 0.5;
    // Borde neón
    const bordeL = new THREE.Mesh(new THREE.BoxGeometry(2.1, 6.1, 0.1), matNeonRosa);
    sideL.add(bordeL);
    escenario.add(sideL);

    // Derecha
    const sideR = new THREE.Mesh(geoSideScreen, matSideScreen);
    sideR.position.set(8, 3, 5);
    sideR.rotation.y = -0.5;
    const bordeR = new THREE.Mesh(new THREE.BoxGeometry(2.1, 6.1, 0.1), matNeonRosa);
    sideR.add(bordeR);
    escenario.add(sideR);

    // ==========================================
    // 3. LA CONSOLA (Mismo código de antes)
    // ==========================================
    const consolaGroup = new THREE.Group();
    consolaGroup.position.set(0, 1.5, 9); 

    const geoPilar = new THREE.BoxGeometry(1.5, 3, 1);
    const pilar = new THREE.Mesh(geoPilar, matConsola);
    pilar.position.y = -1.5; 
    consolaGroup.add(pilar);

    const geoPanel = new THREE.BoxGeometry(2.5, 0.2, 1.5);
    const panel = new THREE.Mesh(geoPanel, matConsola);
    panel.rotation.x = 0.5; 
    panel.position.set(0, 0.2, 0);
    consolaGroup.add(panel);

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), new THREE.MeshBasicMaterial({ color: 0x002244 }));
    screen.rotation.x = -Math.PI / 2 + 0.5; 
    screen.position.set(0, 0.31, 0.2); 
    consolaGroup.add(screen);

    // BOTONES
    const loaderFont = new FontLoader();
    loaderFont.load('./font/helvetiker.json', (font) => {
        const geoBtn = new THREE.ConeGeometry(0.2, 0.1, 3);
        
        // Btn Sig
        const btnSig = new THREE.Mesh(geoBtn, matBotonSig);
        btnSig.rotation.set(0.5, -Math.PI / 2, 0); btnSig.scale.set(1, 0.5, 1);
        btnSig.position.set(0.8, 0.35, 0.2); btnSig.name = "btn_presentacion_siguiente";
        consolaGroup.add(btnSig); interactables.push(btnSig);
        
        const txtSig = new THREE.Mesh(new TextGeometry("SIG >", { font: font, size: 0.1, height: 0.01 }).center(), matTextoBotones);
        txtSig.position.set(0.8, 0.5, 0.2); txtSig.rotation.x = -Math.PI / 4;
        consolaGroup.add(txtSig);

        // Btn Ant
        const btnAnt = new THREE.Mesh(geoBtn, matBotonAnt);
        btnAnt.rotation.set(0.5, Math.PI / 2, 0); btnAnt.scale.set(1, 0.5, 1);
        btnAnt.position.set(-0.8, 0.35, 0.2); btnAnt.name = "btn_presentacion_anterior";
        consolaGroup.add(btnAnt); interactables.push(btnAnt);

        const txtAnt = new THREE.Mesh(new TextGeometry("< ANT", { font: font, size: 0.1, height: 0.01 }).center(), matTextoBotones);
        txtAnt.position.set(-0.8, 0.5, 0.2); txtAnt.rotation.x = -Math.PI / 4;
        consolaGroup.add(txtAnt);

        // Btn Salir
        const btnSalir = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16), matNeonRosa);
        btnSalir.rotation.x = 0.5; btnSalir.position.set(0, 0.2, 0.6);
        btnSalir.name = "btn_presentacion_salir"; consolaGroup.add(btnSalir); interactables.push(btnSalir);

        const txtSalir = new THREE.Mesh(new TextGeometry("SALIR", { font: font, size: 0.08, height: 0.01 }).center(), matTextoBotones);
        txtSalir.position.set(0, 0.25, 0.8); txtSalir.rotation.x = -Math.PI / 4;
        consolaGroup.add(txtSalir);
    });
    escenario.add(consolaGroup);

    // 4. LUCES
    const luzFoco = new THREE.SpotLight(0xffffff, 2);
    luzFoco.position.set(0, 10, 5);
    luzFoco.target.position.set(0, 2, 0);
    luzFoco.angle = Math.PI / 4;
    luzFoco.penumbra = 0.5;
    escenario.add(luzFoco);
    escenario.add(luzFoco.target);

    // Luz ambiental azulada para dar atmósfera
    const luzAmbiente = new THREE.PointLight(0x0000ff, 0.5, 20);
    luzAmbiente.position.set(0, 5, 5);
    escenario.add(luzAmbiente);

    // 5. GRUPO CONTENIDO
    grupoContenido = new THREE.Group();
    escenario.add(grupoContenido);

    mostrarDiapositiva(0);
    scene.add(escenario);
}
// --- LÓGICA DE CAMBIO ---

export function cambiarDiapositiva(direccion) {
    diapositivaActual += direccion;
    if (diapositivaActual < 0) diapositivaActual = 0;
    if (diapositivaActual >= totalDiapositivas) diapositivaActual = totalDiapositivas - 1;
    mostrarDiapositiva(diapositivaActual);
}// --- PARTE 1: SUSTITUYE LA FUNCIÓN 'mostrarDiapositiva' ---

function mostrarDiapositiva(indice) {
    // 1. Limpiar lo anterior
    while(grupoContenido.children.length > 0){ 
        grupoContenido.remove(grupoContenido.children[0]); 
    }

    const loaderFont = new FontLoader();
    loaderFont.load('./font/helvetiker.json', (font) => {
        
        // Función auxiliar para texto (Ahora un poco más arriba)
        const crearTexto = (msj, size, y, color) => {
            const geo = new TextGeometry(msj, { font: font, size: size, height: 0.05 });
            geo.center();
            const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: color }));
            mesh.position.y = y;
            grupoContenido.add(mesh);
        };

        // Función para que los objetos giren solitos
        const rotarObjeto = (obj) => {
            const anim = () => { 
                if(obj) obj.rotation.y += 0.01; 
                requestAnimationFrame(anim); 
            };
            anim();
        };

        // --- CONTENIDO: 2 OBJETOS POR DIAPOSITIVA (IZQ y DER) ---
        switch(indice) {case 0: // SOBRE MÍ (Gamer HD)
                crearTexto("BRENDA ALEJANDRA", 0.7, 6.5, 0xff00ff);
                crearTexto("Ingeniera Multimedia | 22 Anos", 0.4, 5.5, 0xffffff);
                crearTexto("Gamer | Streamer", 0.35, 4.8, 0x00ffff);
                
                // --- IZQUIERDA: GAMEBOY DETALLADO ---
                const gameboy = new THREE.Group();
                // Carcasa
                const gbBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.8, 0.4), new THREE.MeshStandardMaterial({color: 0x880088})); // Morado
                gameboy.add(gbBody);
                // Marco Pantalla (Gris oscuro)
                const gbMarco = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.05), new THREE.MeshBasicMaterial({color: 0x333333}));
                gbMarco.position.set(0, 0.5, 0.21);
                gameboy.add(gbMarco);
                // Pantalla Verde
                const gbScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), new THREE.MeshBasicMaterial({color: 0x99ff99}));
                gbScreen.position.set(0, 0.5, 0.24);
                gameboy.add(gbScreen);
                // Cruz (D-Pad)
                const dpad = new THREE.Group();
                const dV = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.45, 0.1), new THREE.MeshStandardMaterial({color: 0x111111}));
                const dH = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.1), new THREE.MeshStandardMaterial({color: 0x111111}));
                dpad.add(dV); dpad.add(dH);
                dpad.position.set(-0.5, -0.6, 0.22);
                gameboy.add(dpad);
                // Botones A y B
                const btnA = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1), new THREE.MeshStandardMaterial({color: 0xff0000}));
                btnA.rotation.x = Math.PI/2; btnA.position.set(0.5, -0.5, 0.22);
                gameboy.add(btnA);
                const btnB = btnA.clone();
                btnB.position.set(0.2, -0.7, 0.22);
                gameboy.add(btnB);

                gameboy.position.set(-4, 3.5, 0);
                rotarObjeto(gameboy);
                grupoContenido.add(gameboy);
// --- DERECHA: NINTENDO SWITCH (BORDES REDONDOS) 🎮✨ ---
                const nSwitch = new THREE.Group();
                
                // FUNCIÓN MÁGICA PARA REDONDEAR 🪄
                const crearCajaRedonda = (ancho, alto, grosor, radio, color) => {
                    const shape = new THREE.Shape();
                    const x = -ancho/2, y = -alto/2;
                    shape.moveTo(x + radio, y);
                    shape.lineTo(x + ancho - radio, y);
                    shape.quadraticCurveTo(x + ancho, y, x + ancho, y + radio);
                    shape.lineTo(x + ancho, y + alto - radio);
                    shape.quadraticCurveTo(x + ancho, y + alto, x + ancho - radio, y + alto);
                    shape.lineTo(x + radio, y + alto);
                    shape.quadraticCurveTo(x, y + alto, x, y + alto - radio);
                    shape.lineTo(x, y + radio);
                    shape.quadraticCurveTo(x, y, x + radio, y);

                    const geo = new THREE.ExtrudeGeometry(shape, {
                        depth: grosor, 
                        bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02
                    });
                    geo.center(); // Centramos la geometría
                    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color: color, roughness: 0.2}));
                };

                // 1. Pantalla (Cuerpo Central)
                const swCuerpo = crearCajaRedonda(2, 1.2, 0.1, 0.1, 0x111111);
                nSwitch.add(swCuerpo);
                
                // Cristal Pantalla (Plano con brillo)
                const swGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1), new THREE.MeshBasicMaterial({color: 0x000000}));
                swGlass.position.z = 0.06; // Apenas salido
                nSwitch.add(swGlass);
                // Reflejo falso
                const reflejo = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 1), new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.1}));
                reflejo.position.set(0.5, 0, 0.07); reflejo.rotation.z = 0.2;
                nSwitch.add(reflejo);

                // 2. Joy-Con Izquierdo (Azul) - Redondeado
                const joyL = crearCajaRedonda(0.6, 1.2, 0.12, 0.3, 0x00ffff);
                joyL.position.x = -1.35;
                nSwitch.add(joyL);
                
                // Stick L
                const stickL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1), new THREE.MeshStandardMaterial({color: 0x222222}));
                stickL.rotation.x = Math.PI/2; stickL.position.set(-1.35, 0.2, 0.1); nSwitch.add(stickL);
                
                // Flechas (Botones)
                const btnDir = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05), new THREE.MeshStandardMaterial({color: 0x222222}));
                btnDir.rotation.x = Math.PI/2;
                const bU=btnDir.clone(); bU.position.set(-1.35, -0.15, 0.1); nSwitch.add(bU);
                const bD=btnDir.clone(); bD.position.set(-1.35, -0.35, 0.1); nSwitch.add(bD);
                const bL=btnDir.clone(); bL.position.set(-1.45, -0.25, 0.1); nSwitch.add(bL);
                const bR=btnDir.clone(); bR.position.set(-1.25, -0.25, 0.1); nSwitch.add(bR);


                // 3. Joy-Con Derecho (Rojo) - Redondeado
                const joyR = crearCajaRedonda(0.6, 1.2, 0.12, 0.3, 0xff3333);
                joyR.position.x = 1.35;
                nSwitch.add(joyR);

                // Stick R
                const stickR = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1), new THREE.MeshStandardMaterial({color: 0x222222}));
                stickR.rotation.x = Math.PI/2; stickR.position.set(1.35, -0.2, 0.1); nSwitch.add(stickR);

                // Botones ABXY
                const bY=btnDir.clone(); bY.position.set(1.35, 0.35, 0.1); nSwitch.add(bY);
                const bA=btnDir.clone(); bA.position.set(1.35, 0.15, 0.1); nSwitch.add(bA);
                const bX=btnDir.clone(); bX.position.set(1.45, 0.25, 0.1); nSwitch.add(bX);
                const bB=btnDir.clone(); bB.position.set(1.25, 0.25, 0.1); nSwitch.add(bB);

                nSwitch.position.set(4, 4.5, 0);
                rotarObjeto(nSwitch);
                grupoContenido.add(nSwitch);
                break;
case 1: // METAS (Cohete Pro + Diana con Flecha)
                crearTexto("MIS METAS", 0.7, 6.5, 0x00ff00);
                crearTexto("Especialista en Marketing", 0.4, 5.5, 0xffffff);
                crearTexto("Disenadora Top", 0.4, 4, 0xffff00);
                
                // --- IZQUIERDA: COHETE ESPACIAL HD ---
                const cohete = new THREE.Group();
                // Cuerpo principal (Cilindro suave)
                const cuerpoC = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.8, 32), new THREE.MeshStandardMaterial({color: 0xeeeeee, roughness: 0.3}));
                cohete.add(cuerpoC);
                
                // Punta (Roja brillante)
                const puntaC = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.7, 32), new THREE.MeshStandardMaterial({color: 0xff0000}));
                puntaC.position.y = 1.25;
                cohete.add(puntaC);
                
                // Ventana (Marco y Cristal)
                const marcoVentana = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.05, 16, 32), new THREE.MeshStandardMaterial({color: 0x555555}));
                marcoVentana.position.set(0, 0.5, 0.38); marcoVentana.rotation.x = 0.2;
                cohete.add(marcoVentana);
                const cristalVentana = new THREE.Mesh(new THREE.CircleGeometry(0.15, 32), new THREE.MeshBasicMaterial({color: 0x00ffff}));
                cristalVentana.position.set(0, 0.5, 0.4); cristalVentana.rotation.x = 0.2; // Un poco inclinado
                cohete.add(cristalVentana);

                // Aletas (4 aletas usando cajas rotadas)
                const matAletas = new THREE.MeshStandardMaterial({color: 0x0000cc});
                for(let i=0; i<4; i++) {
                    const aleta = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.4), matAletas);
                    aleta.position.y = -0.6;
                    // Las alejamos del centro y las rotamos
                    aleta.position.x = Math.cos(i * Math.PI/2) * 0.45;
                    aleta.position.z = Math.sin(i * Math.PI/2) * 0.45;
                    aleta.rotation.y = -i * Math.PI/2;
                    cohete.add(aleta);
                }

                // Fuego del motor (Cono invertido naranja)
                const fuego = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 16), new THREE.MeshBasicMaterial({color: 0xffaa00}));
                fuego.position.y = -1.4;
                fuego.rotation.x = Math.PI; // Apunta abajo
                cohete.add(fuego);

                // Posición y Animación
                cohete.position.set(-4, 4.5, 0); 
                cohete.rotation.z = -0.3; // Despegando en diagonal
                
                const animCohete = () => { 
                    if(cohete) {
                        // Flota arriba y abajo
                        cohete.position.y = 4.5 + Math.sin(Date.now()*0.005)*0.3; 
                        // El fuego parpadea (escala)
                        fuego.scale.setScalar(0.8 + Math.random()*0.4);
                    }
                    requestAnimationFrame(animCohete); 
                };
                animCohete();
                grupoContenido.add(cohete);


                // --- DERECHA: DIANA CON FLECHA (Tiro al blanco) ---
                const dianaGroup = new THREE.Group();
                
                // Tablero (Anillos concéntricos)
                const crearAnillo = (radio, color, z) => {
                    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radio, radio, 0.05, 32), new THREE.MeshStandardMaterial({color: color}));
                    mesh.rotation.x = Math.PI / 2; // Parado vertical
                    mesh.position.z = z;
                    dianaGroup.add(mesh);
                };
                
                crearAnillo(1.2, 0xff0000, 0);    // Rojo Grande
                crearAnillo(0.9, 0xffffff, 0.02); // Blanco
                crearAnillo(0.6, 0xff0000, 0.04); // Rojo Medio
                crearAnillo(0.3, 0xffffff, 0.06); // Blanco Centro
                crearAnillo(0.15, 0xff0000, 0.08); // Bullseye (Centro exacto)

                // La Flecha clavada
                const flecha = new THREE.Group();
                // Palo
                const palo = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2), new THREE.MeshStandardMaterial({color: 0x8B4513}));
                palo.rotation.x = Math.PI / 2;
                palo.position.z = 0.6; // Saliendo de la diana
                flecha.add(palo);
                // Plumas (Cola)
                const pluma1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.2), new THREE.MeshStandardMaterial({color: 0xffff00}));
                pluma1.position.z = 1.1;
                flecha.add(pluma1);
                const pluma2 = pluma1.clone();
                pluma2.rotation.z = Math.PI / 2;
                flecha.add(pluma2);

                // Clavamos la flecha un poco chueca para realismo
                flecha.position.set(0.1, 0.2, 0.1); 
                flecha.rotation.set(0.1, 0.1, 0); 
                dianaGroup.add(flecha);

                // Posición y Animación
                dianaGroup.position.set(4, 4.5, 0);
                rotarObjeto(dianaGroup);
                grupoContenido.add(dianaGroup);
                break;case 2: // ESTUDIOS (Birrete HD + Pergamino con Sello)
                crearTexto("FORMACION ACADEMICA", 0.6, 6.5, 0xffaa00);
                crearTexto("Universidad Estatal del Valle de Ecatepec", 0.35, 5.5, 0xffffff);
                crearTexto("Ingeniería en Comunicación Multimedia", 0.3, 4.8, 0xcccccc);
                
                // --- IZQUIERDA: BIRRETE DE GRADUACIÓN HD ---
                const birrete = new THREE.Group();
                
                // 1. La Tapa (Cuadrado superior)
                const tapa = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.4), new THREE.MeshStandardMaterial({color: 0x111111, roughness: 0.5}));
                birrete.add(tapa);
                
                // 2. La Base (Donde va la cabeza)
                const baseB = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32), new THREE.MeshStandardMaterial({color: 0x111111}));
                baseB.position.y = -0.25;
                birrete.add(baseB);
                
                // 3. Botón Dorado (Centro)
                const boton = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16), new THREE.MeshStandardMaterial({color: 0xffd700, metalness: 0.8}));
                boton.position.y = 0.06;
                birrete.add(boton);

                // 4. La Borla (El hilo que cuelga)
                const borlaGroup = new THREE.Group();
                // Hilo horizontal
                const hilo1 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.6), new THREE.MeshBasicMaterial({color: 0xffd700}));
                hilo1.rotation.z = Math.PI / 2;
                hilo1.position.x = 0.3; // Sale del centro a la derecha
                borlaGroup.add(hilo1);
                // Hilo vertical (caída)
                const hilo2 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4), new THREE.MeshBasicMaterial({color: 0xffd700}));
                hilo2.position.set(0.6, -0.2, 0); 
                borlaGroup.add(hilo2);
                // El fleco final (Pelitos)
                const fleco = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 16), new THREE.MeshStandardMaterial({color: 0xffd700}));
                fleco.position.set(0.6, -0.4, 0);
                borlaGroup.add(fleco);
                
                // Ponemos la borla arriba
                borlaGroup.position.y = 0.06;
                birrete.add(borlaGroup);

                // Posición y Animación
                birrete.position.set(-4, 4.5, 0);
                // Animación: Flota y gira lento
                const animBirrete = () => { 
                    if(birrete) {
                        birrete.rotation.y += 0.005; 
                        birrete.position.y = 4.5 + Math.sin(Date.now()*0.003)*0.2;
                    }
                    requestAnimationFrame(animBirrete); 
                };
                animBirrete();
                grupoContenido.add(birrete);


                // --- DERECHA: PERGAMINO CON SELLO ---
                const diplomaGroup = new THREE.Group();
                
                // 1. El Papel Enrollado (Blanco hueso)
                const papelGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.8, 32);
                const papelMat = new THREE.MeshStandardMaterial({color: 0xfffff0}); // Blanco crema
                const papel = new THREE.Mesh(papelGeo, papelMat);
                papel.rotation.z = Math.PI / 2; // Acostado
                diplomaGroup.add(papel);

                // 2. El Listón Rojo
                const liston = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 16, 50), new THREE.MeshStandardMaterial({color: 0xff0000}));
                liston.rotation.y = Math.PI / 2;
                diplomaGroup.add(liston);

                // 3. Sello de Cera Dorado (Wax Seal)
                const sello = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16), new THREE.MeshStandardMaterial({color: 0xffaa00, roughness: 0.3}));
                sello.position.set(0, 0, 0.16); // Al frente del listón
                sello.rotation.x = Math.PI / 2;
                diplomaGroup.add(sello);
                
                // Detalle del sello (Centro hundido)
                const selloInner = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), new THREE.MeshStandardMaterial({color: 0xcc8800}));
                selloInner.position.set(0, 0, 0.17);
                selloInner.rotation.x = Math.PI / 2;
                diplomaGroup.add(selloInner);

                // Posición y Animación
                diplomaGroup.position.set(4, 4.5, 0);
                // Animación: Gira sobre su eje X para mostrarse
                const animDip = () => { 
                    if(diplomaGroup) {
                        diplomaGroup.rotation.y -= 0.01; 
                        diplomaGroup.rotation.z = Math.sin(Date.now()*0.002) * 0.1; // Se mece un poquito
                    }
                    requestAnimationFrame(animDip); 
                };
                animDip();
                grupoContenido.add(diplomaGroup);
                break;
case 3: // SOFTWARE (Torre y Núcleo - BAJADOS DE NIVEL)
                crearTexto("DOMINIO DE SOFTWARE", 0.7, 6.5, 0x0000ff);
                crearTexto("ZBrush (100%) | DreamWeaver (100%)", 0.4, 5.5, 0xffffff);
                crearTexto("Maya (85%) | 3ds Max (85%) | Premiere (85%)", 0.35, 4.8, 0x00ffff);
                
                // --- IZQUIERDA: TORRE DE SERVIDORES HOLOGRÁFICOS ---
                const serverRack = new THREE.Group();
                
                // Base metálica
                const baseRack = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 6), new THREE.MeshStandardMaterial({color: 0x111111}));
                baseRack.position.y = -1.5;
                serverRack.add(baseRack);

                // Paneles Flotantes
                const panelGeo = new THREE.CylinderGeometry(1, 1, 0.1, 6);
                const panelMat = new THREE.MeshPhysicalMaterial({
                    color: 0x00aaff, metalness: 0.5, roughness: 0.1, 
                    transparent: true, opacity: 0.6, transmission: 0.2
                });

                for(let i=0; i<4; i++) {
                    const panel = new THREE.Mesh(panelGeo, panelMat);
                    panel.position.y = -1.0 + (i * 0.6); 
                    const anillo = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.02, 16, 6), new THREE.MeshBasicMaterial({color: 0xffffff}));
                    anillo.rotation.x = Math.PI / 2;
                    panel.add(anillo);
                    serverRack.add(panel);
                }

                const coreLuz = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3, 32), new THREE.MeshBasicMaterial({color: 0x00ffff, transparent: true, opacity: 0.5}));
                serverRack.add(coreLuz);

                // CAMBIO AQUÍ: Bajamos Y de 4.5 a 2.0 👇
                serverRack.position.set(-4, 2.0, 0);
                
                const animRack = () => { 
                    if(serverRack) {
                        serverRack.rotation.y += 0.005; 
                        coreLuz.scale.x = 1 + Math.sin(Date.now()*0.005)*0.1;
                        coreLuz.scale.z = coreLuz.scale.x;
                    }
                    requestAnimationFrame(animRack); 
                };
                animRack();
                grupoContenido.add(serverRack);


                // --- DERECHA: ARTEFACTO WIREFRAME ---
                const artifact3D = new THREE.Group();

                const geoIco = new THREE.IcosahedronGeometry(1.2, 0);
                const matWire = new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe: true});
                const ico = new THREE.Mesh(geoIco, matWire);
                artifact3D.add(ico);

                const geoDod = new THREE.DodecahedronGeometry(0.7, 0);
                const matSolid = new THREE.MeshStandardMaterial({color: 0xffaa00, roughness: 0.2, metalness: 1.0});
                const dod = new THREE.Mesh(geoDod, matSolid);
                artifact3D.add(dod);

                const atomo = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshBasicMaterial({color: 0xffffff}));
                const orbita = new THREE.Group();
                atomo.position.x = 1.8; 
                orbita.add(atomo);
                artifact3D.add(orbita);
                
                const orbita2 = orbita.clone();
                orbita2.rotation.z = Math.PI / 2;
                artifact3D.add(orbita2);

                // CAMBIO AQUÍ: Bajamos Y de 4.5 a 2.0 👇
                artifact3D.position.set(4, 2.0, 0);
                
                const animArt = () => { 
                    if(artifact3D) {
                        ico.rotation.x += 0.005; ico.rotation.y += 0.005; 
                        dod.rotation.x -= 0.01; dod.rotation.y -= 0.01; 
                        orbita.rotation.y += 0.05; 
                        orbita2.rotation.x += 0.05;
                    }
                    requestAnimationFrame(animArt); 
                };
                animArt();
                grupoContenido.add(artifact3D);
                break;
                
                case 4: // CONCLUSIÓN (Corazón Arreglado + Celular Pro)
                crearTexto("GRACIAS POR VER", 0.8, 6.5, 0xff00ff);
                crearTexto("Contactame para trabajar juntos", 0.4, 5.5, 0xffffff);
                
                // --- IZQUIERDA: CORAZÓN 3D (ARREGLADO) ---
                const heartGroup = new THREE.Group();
                const x = 0, y = 0;
                const heartShape = new THREE.Shape();
                // Dibujo del corazón
                heartShape.moveTo( x + 0.5, y + 0.5 );
                heartShape.bezierCurveTo( x + 0.5, y + 0.5, x + 0.4, y, x, y );
                heartShape.bezierCurveTo( x - 0.6, y, x - 0.6, y + 0.7,x - 0.6, y + 0.7 );
                heartShape.bezierCurveTo( x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9 );
                heartShape.bezierCurveTo( x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7 );
                heartShape.bezierCurveTo( x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y );
                heartShape.bezierCurveTo( x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5 );

                const geoHeart = new THREE.ExtrudeGeometry( heartShape, { 
                    depth: 0.4, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 
                });
                geoHeart.center(); 
                
                const matHeart = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.2, metalness: 0.5, emissive: 0x550000 });
                const heartMesh = new THREE.Mesh( geoHeart, matHeart );
                
                // CORRECCIÓN ROTACIÓN: Ahora está derecho
                heartMesh.rotation.z = Math.PI; 
                heartMesh.rotation.x = Math.PI; 
                // Ajuste extra para asegurar que la punta apunte abajo
                heartGroup.rotation.z = Math.PI; 

                heartGroup.add(heartMesh);

                // CORRECCIÓN ALTURA: Subido a 3.5
                heartGroup.position.set(-4, 3.5, 0); 
                
                const animHeart = () => { 
                    if(heartGroup) {
                        heartGroup.rotation.y += 0.01; 
                        const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1; 
                        heartGroup.scale.setScalar(scale);
                    }
                    requestAnimationFrame(animHeart); 
                };
                animHeart();
                grupoContenido.add(heartGroup);


                // --- DERECHA: SMARTPHONE MODERNO (Cristal Negro) ---
                const phoneGroup = new THREE.Group();
                
                // Marco metálico (Borde)
                const phoneFrame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.4, 0.08), new THREE.MeshStandardMaterial({color: 0x888888, metalness: 1.0, roughness: 0.2}));
                phoneGroup.add(phoneFrame);
                
                // Cuerpo de Cristal Negro
                const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.35, 0.09), new THREE.MeshPhysicalMaterial({color: 0x000000, metalness: 0.9, roughness: 0.0, clearcoat: 1.0}));
                phoneGroup.add(phoneBody);

                // Pantalla Encendida (Azulada suave)
                const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 2.2), new THREE.MeshBasicMaterial({color: 0x001133}));
                phoneScreen.position.z = 0.051;
                phoneGroup.add(phoneScreen);

                // Icono de "Mensaje" (Estilo App)
                const iconBg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.02), new THREE.MeshBasicMaterial({color: 0x00ccff})); // Fondo azul app
                iconBg.position.z = 0.06;
                phoneGroup.add(iconBg);

                // Sobre blanco simple sobre el icono
                const mailGeo = new THREE.PlaneGeometry(0.3, 0.2);
                const mailIcon = new THREE.Mesh(mailGeo, new THREE.MeshBasicMaterial({color: 0xffffff}));
                mailIcon.position.z = 0.07;
                phoneGroup.add(mailIcon);
                // Triangulo del sobre
                const flapGeo = new THREE.ConeGeometry(0.15, 0.1, 3);
                const flapIcon = new THREE.Mesh(flapGeo, new THREE.MeshBasicMaterial({color: 0xdddddd}));
                flapIcon.rotation.z = Math.PI;
                flapIcon.position.set(0, 0.05, 0.071);
                phoneGroup.add(flapIcon);

                // CORRECCIÓN ALTURA: Subido a 3.5
                phoneGroup.position.set(4, 3.5, 0); 
                
                const animPhone = () => {
                    if(phoneGroup) {
                        phoneGroup.rotation.y -= 0.005; // Gira lento
                        // El celular flota suavemente
                        phoneGroup.position.y = 3.5 + Math.sin(Date.now() * 0.002) * 0.1;
                    }
                    requestAnimationFrame(animPhone);
                };
                animPhone();
                grupoContenido.add(phoneGroup);
                break;


        }
    });
}