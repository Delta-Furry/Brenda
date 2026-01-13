import * as THREE from 'three';
import { FontLoader } from './FontLoader.js';
import { TextGeometry } from './TextGeometry.js';

// --- MATERIALES ---
const matPlasticoNegro = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
const matMadera = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 });
const matTelaCama = new THREE.MeshStandardMaterial({ color: 0x663399, roughness: 1 }); 
const matTelaAlmohada = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 1 });
const matCarton = new THREE.MeshStandardMaterial({ color: 0xc19a6b });
const matPeluche = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 1 }); 
const matFlecha = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Flechas Cian
const matMarco = new THREE.MeshStandardMaterial({ color: 0x000000 });
const matPared = new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.BackSide });

export function cargarHabitacion(scene, gltfLoader, interactables) {
    const grupo = new THREE.Group();
    grupo.position.set(-100, 0, 0); 

    // 1. ESTRUCTURA
    crearCuarto(grupo);

    // 2. MUEBLES
    const cama = crearCama(); cama.position.set(-3.5, 0, -2.5); grupo.add(cama);
    const buro = crearBuro(); buro.position.set(-0.5, 0, -4); grupo.add(buro);
    const escritorio = crearEscritorioGamer(); escritorio.position.set(2, 0, -4); grupo.add(escritorio);
    const silla = crearSillaGamer(); silla.position.set(2, 0, -2.5); silla.rotation.y = Math.PI + 0.2; grupo.add(silla);

    // 3. DECORACIÓN
    crearCajaMercancia(grupo, gltfLoader, 4, 0, 2); 
    
    const alfombra = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.1, 32), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    alfombra.position.set(0, 0.05, 0);
    grupo.add(alfombra);

    // Textos Neón (Altos)
    crearTextoPared(grupo, "STREAMING", -0, 5.5, -5.9, 0, 0x00ffff, 0.4);
    crearTextoPared(grupo, "EMPRENDEDORA", 5.9, 5.5, -0, -Math.PI/2, 0xff00ff, 0.5);
    crearTextoPared(grupo, "FOTOGRAFA", -5.9, 5.5, 0, Math.PI/2, 0xffff00, 0.5);

    // 4. SISTEMA DE GALERÍA
    
    // --- CORRECCIÓN FINAL: BOTÓN EN LA PARED TRASERA (VACÍA) ---
    // Posición z=5.8 (Pared del fondo), Rotación 180 grados (Math.PI)
    crearBotonInicioGaleria(grupo, 0, 3.5, 5.8, Math.PI, interactables);

    // Paredes de Galería (Solo en las otras 3 paredes)
    crearParedGaleria(grupo, interactables, 0, 3, -5.8, 0, "frente");
    crearParedGaleria(grupo, interactables, 5.8, 3, 0, -Math.PI/2, "der");
    crearParedGaleria(grupo, interactables, -5.8, 3, 0, Math.PI/2, "izq");

    // 5. BOTÓN SALIR (Gorra)
    crearBotonRegresar(grupo, gltfLoader, interactables);

    scene.add(grupo);
}

// =========================================================
// --- FUNCIONES DE GALERÍA Y BOTONES ---
// =========================================================

function crearBotonInicioGaleria(grupo, x, y, z, rotY, interactables) {
    const botonGroup = new THREE.Group();
    botonGroup.position.set(x, y, z); 
    botonGroup.rotation.y = rotY; 

    // Botón físico
    const geo = new THREE.BoxGeometry(1.5, 0.5, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff00ff }); 
    const mesh = new THREE.Mesh(geo, mat);
    
    mesh.name = "boton_ver_galeria"; 
    // Lo movemos un pelín en Z local para que salga de la pared
    mesh.position.z = 0.1; 

    botonGroup.add(mesh);
    interactables.push(mesh); 

    // Texto
    const loader = new FontLoader();
    loader.load('./font/helvetiker.json', (font) => {
        const textGeo = new TextGeometry("VER GALERIA", { font: font, size: 0.15, height: 0.02 });
        textGeo.center();
        const texto = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        texto.position.z = 0.16;
        texto.name = "boton_ver_galeria"; 
        botonGroup.add(texto);
        interactables.push(texto); 
    });

    grupo.add(botonGroup);
}function crearParedGaleria(grupo, interactables, x, y, z, rotY, id) {
    const contenedor = new THREE.Group();
    contenedor.position.set(x, y, z);
    contenedor.rotation.y = rotY;

    const textureLoader = new THREE.TextureLoader();

    // --- MATEMÁTICA DE LAS FOTOS ---
    // Calculamos desde qué número empezar según la pared
    let inicio = 0;
    if (id === "frente") inicio = 0; // Fotos 1 a 4
    else if (id === "der") inicio = 4; // Fotos 5 a 8
    else if (id === "izq") inicio = 8; // Fotos 9 a 12

    // Posiciones de los 4 cuadros
    const posiciones = [[-1, 0.5], [1, 0.5], [-1, -0.8], [1, -0.8]];
    
    posiciones.forEach((pos, i) => {
        // Marco
        const marco = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.1), matMarco);
        marco.position.set(pos[0], pos[1], 0);

        // --- CARGAR LA FOTO CORRECTA ---
        // Fórmula: Índice del cuadro (0-3) + 1 + El inicio de la pared
        // Ejemplo pared Derecha: 0 + 1 + 4 = 5.jpg
        const numImagen = i + 1 + inicio; 
        
        // Cargamos la textura
        const textura = textureLoader.load(`./assets/textures/${numImagen}.jpg`);
        const materialFoto = new THREE.MeshBasicMaterial({ map: textura });

        const imagen = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), materialFoto);
        imagen.position.z = 0.06; // Un pelín afuera del marco
        
        marco.add(imagen);
        contenedor.add(marco);
    });

    // --- FLECHAS DE NAVEGACIÓN ---
    const flechaSig = crearFlechaShape();
    flechaSig.position.set(2, 0, 0.2); 
    flechaSig.rotation.z = -Math.PI / 2;
    flechaSig.name = "flecha_siguiente_" + id;
    contenedor.add(flechaSig);
    interactables.push(flechaSig); 

    const flechaAnt = crearFlechaShape();
    flechaAnt.position.set(-2, 0, 0.2); 
    flechaAnt.rotation.z = Math.PI / 2;
    flechaAnt.name = "flecha_anterior_" + id;
    contenedor.add(flechaAnt);
    interactables.push(flechaAnt);

    grupo.add(contenedor);
}

function crearFlechaShape() {
    const shape = new THREE.Shape();
    shape.moveTo(-0.3, -0.3); shape.lineTo(0.3, -0.3); shape.lineTo(0, 0.3); shape.lineTo(-0.3, -0.3);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
    const mesh = new THREE.Mesh(geo, matFlecha);
    function latir() {
        requestAnimationFrame(latir);
        const escala = 1 + Math.sin(Date.now() * 0.005) * 0.1;
        mesh.scale.set(escala, escala, 1);
    }
    latir();
    return mesh;
}

// =========================================================
// --- DECORACIÓN Y MUEBLES ---
// =========================================================

function crearTextoPared(grupo, mensaje, x, y, z, rotY, colorHex, tamano) {
    const loader = new FontLoader();
    loader.load('./font/helvetiker.json', (font) => {
        const textGeo = new TextGeometry(mensaje, { font: font, size: tamano, height: 0.1 });
        textGeo.center();
        const mesh = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial({ color: colorHex }));
        mesh.position.set(x, y, z);
        mesh.rotation.y = rotY;
        grupo.add(mesh);
    });
}
function crearCuarto(grupo) {
    // 1. La caja de la habitación
    const habitacion = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 12), matPared);
    habitacion.position.y = 3; 
    habitacion.receiveShadow = true; 
    grupo.add(habitacion);

    // 2. El Piso
    // Nota: Verifiqué tu carpeta assets y la ruta correcta suele ser './assets/textures/t_piso.jpg'
    // Si tu imagen se llama diferente, solo cambia el nombre aquí.
    const textPiso = new THREE.TextureLoader().load('./assets/textures/t_piso.jpg');
    
    let piso; // Declaramos la variable afuera para poder usarla después

    if(textPiso) {
        textPiso.wrapS = THREE.RepeatWrapping; 
        textPiso.wrapT = THREE.RepeatWrapping; 
        textPiso.repeat.set(4, 4);
        piso = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ map: textPiso }));
    } else {
        piso = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    }

    // --- CORRECCIÓN IMPORTANTE ---
    piso.rotation.x = -Math.PI / 2; // Acostado
    piso.position.y = 0.1;         // POSITIVO (+0.05) para que quede ENCIMA del suelo de la caja
    
    grupo.add(piso);

    // 3. Luz del techo
    const luzTecho = new THREE.PointLight(0xffffff, 0.8, 15);
    luzTecho.position.set(0, 5, 0); 
    grupo.add(luzTecho);
}

function crearCama() {
    const grupo = new THREE.Group();

    // 1. LAS PATAS (4 Cilindros)
    const pataGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.5);
    const pataMat = new THREE.MeshStandardMaterial({ color: 0x333333 }); // Patas oscuras
    
    const posicionesPatas = [
        [-1.6, 0.25, -2.8], [1.6, 0.25, -2.8], // Cabecera
        [-1.6, 0.25, 2.8],  [1.6, 0.25, 2.8]   // Pies
    ];

    posicionesPatas.forEach(pos => {
        const pata = new THREE.Mesh(pataGeo, pataMat);
        pata.position.set(...pos);
        grupo.add(pata);
    });

    // 2. BASE DE MADERA (El somier)
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 6), matMadera);
    base.position.y = 0.65; // Encima de las patas
    grupo.add(base);

    // 3. CABECERA (Alta y elegante)
    const cabecera = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2, 0.2), matMadera);
    cabecera.position.set(0, 1.5, -2.9); // Atrás del todo
    grupo.add(cabecera);

    // 4. COLCHÓN (Blanco)
    const colchon = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.4, 5.8), new THREE.MeshStandardMaterial({color: 0xffffff}));
    colchon.position.y = 1; 
    grupo.add(colchon);

    // 5. EDREDÓN / COLCHA GAMER (Morada)
    // Lo hacemos un poco más ancho que el colchón para simular que cuelga
    const edredon = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 4.5), matTelaCama);
    edredon.position.set(0, 1.25, 0.7); // Cubre solo 3/4 de la cama
    grupo.add(edredon);

    // 6. ALMOHADAS (Dos, un poco chuecas para realismo)
    const almohadaGeo = new THREE.BoxGeometry(1.4, 0.25, 0.8);
    
    const almohada1 = new THREE.Mesh(almohadaGeo, matTelaAlmohada);
    almohada1.position.set(-0.8, 1.35, -2.2);
    almohada1.rotation.set(0.1, 0, 0.1); // Inclinación relax
    grupo.add(almohada1);

    const almohada2 = new THREE.Mesh(almohadaGeo, matTelaAlmohada);
    almohada2.position.set(0.8, 1.35, -2.2);
    almohada2.rotation.set(0.1, 0, -0.1); // Inclinación relax opuesta
    grupo.add(almohada2);


    return grupo;
}

function crearBuro() {
    const grupo = new THREE.Group();

    // 1. PATAS (Estilo nórdico/moderno)
    const pataGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.6);
    const pataMat = new THREE.MeshStandardMaterial({ color: 0x111111 }); 
    const patas = [
        [-0.6, 0.3, -0.6], [0.6, 0.3, -0.6], // Atrás
        [-0.6, 0.3, 0.6],  [0.6, 0.3, 0.6]   // Adelante
    ];
    patas.forEach(pos => {
        const p = new THREE.Mesh(pataGeo, pataMat);
        p.position.set(...pos);
        grupo.add(p);
    });

    // 2. CUERPO DEL MUEBLE (Madera)
    const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.5), matMadera);
    cuerpo.position.y = 1.0; // Encima de las patas
    grupo.add(cuerpo);

    // 3. CAJONES (Frentes negros)
    const cajonGeo = new THREE.BoxGeometry(1.3, 0.35, 0.05);
    const cajon1 = new THREE.Mesh(cajonGeo, matPlasticoNegro);
    cajon1.position.set(0, 1.15, 0.76); // Cajón arriba
    grupo.add(cajon1);

    const cajon2 = new THREE.Mesh(cajonGeo, matPlasticoNegro);
    cajon2.position.set(0, 0.75, 0.76); // Cajón abajo
    grupo.add(cajon2);

    // 4. LÁMPARA (Modelo 3D real)
    // Base
    const baseLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.1), matPlasticoNegro);
    baseLamp.position.set(0, 1.45, 0);
    grupo.add(baseLamp);
    // Poste
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5), matPlasticoNegro);
    poste.position.set(0, 1.7, 0);
    grupo.add(poste);
    // Pantalla (Color crema)
    const pantalla = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 0.3, 32, 1, true), 
        new THREE.MeshStandardMaterial({color: 0xffffee, side: THREE.DoubleSide, transparent: true, opacity: 0.9})
    );
    pantalla.position.set(0, 1.9, 0);
    grupo.add(pantalla);

    // 5. LUZ (Bombilla dentro de la lámpara)
    const luzBuro = new THREE.PointLight(0xffaa00, 2, 4); // Luz cálida e intensa
    luzBuro.position.set(0, 1.85, 0);
    luzBuro.castShadow = true;
    grupo.add(luzBuro);

    // 6. DETALLE: UN LIBRO AZUL
    const libro = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.5), new THREE.MeshStandardMaterial({color: 0x0055ff}));
    libro.position.set(0.4, 1.43, 0.4);
    libro.rotation.y = 0.5; // Un poco chueco
    grupo.add(libro);

    return grupo;
}


function crearSillaGamer() {
    const grupo = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1), matPlasticoNegro); base.position.y = 0.1; grupo.add(base);
    const asiento = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), matPlasticoNegro); asiento.position.y = 0.7; grupo.add(asiento);
    const respaldo = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.1), matPlasticoNegro); respaldo.position.set(0, 1.3, 0.35); respaldo.rotation.x = -0.1; grupo.add(respaldo);
    const neon = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.11), new THREE.MeshBasicMaterial({color: 0xff00ff})); neon.position.set(0, 1.3, 0.35); neon.rotation.x = -0.1; grupo.add(neon);
    return grupo;
}



function crearEscritorioGamer() {
    const grupo = new THREE.Group();

    // 1. LA MESA
    const tablero = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 1.5), matPlasticoNegro);
    tablero.position.y = 1.5;
    grupo.add(tablero);

    // Mousepad
    const mousepad = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.2), new THREE.MeshStandardMaterial({color: 0x222222}));
    mousepad.rotation.x = -Math.PI / 2;
    mousepad.position.set(0, 1.56, 0);
    grupo.add(mousepad);

    // 2. PATAS NEÓN
    const pataGeo = new THREE.BoxGeometry(0.1, 1.5, 1.2);
    const pata1 = new THREE.Mesh(pataGeo, new THREE.MeshStandardMaterial({color: 0xff00ff})); // Rosa
    pata1.position.set(-1.5, 0.75, 0);
    grupo.add(pata1);

    const pata2 = new THREE.Mesh(pataGeo, new THREE.MeshStandardMaterial({color: 0x00ffff})); // Cian
    pata2.position.set(1.5, 0.75, 0);
    grupo.add(pata2);

    // 3. PC GAMER
    const pc = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 1.0), matPlasticoNegro);
    pc.position.set(1.4, 2.0, 0);
    grupo.add(pc);

    // 4. MONITORES
    // Principal (Horizontal)
    const monitorMain = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.05), matPlasticoNegro);
    monitorMain.position.set(-0.2, 2.2, -0.4);
    const pantalla1 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), new THREE.MeshBasicMaterial({color: 0xffffff}));
    pantalla1.position.z = 0.03; 
    monitorMain.add(pantalla1);
    grupo.add(monitorMain);

    // Secundario (Vertical)
    const monitorSec = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.05), matPlasticoNegro);
    monitorSec.position.set(-1.4, 2.2, -0.2);
    monitorSec.rotation.y = 0.4;
    const pantalla2 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.9), new THREE.MeshBasicMaterial({color: 0xcccccc}));
    pantalla2.position.z = 0.03;
    monitorSec.add(pantalla2);
    grupo.add(monitorSec);

    // 5. PERIFÉRICOS
    // Teclado
    const teclado = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.3), matPlasticoNegro);
    teclado.position.set(-0.2, 1.58, 0.3);
    const luzTeclado = new THREE.PointLight(0x00ff00, 0.5, 1);
    luzTeclado.position.y = 0.1;
    teclado.add(luzTeclado);
    grupo.add(teclado);

    // Mouse (Corregido para que no falle al escalar)
    const mouseGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const mouse = new THREE.Mesh(mouseGeo, matPlasticoNegro);
    mouse.scale.set(1, 0.6, 1.2); // Lo aplastamos aquí, no en la geometría
    mouse.position.set(0.5, 1.58, 0.3);
    grupo.add(mouse);

    // 6. MICRÓFONO (Usando Cilindro en vez de Capsula para evitar error de versión)
    const baseMic = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1), matPlasticoNegro);
    baseMic.position.set(-1.7, 1.55, 0.6);
    grupo.add(baseMic);

    const brazo = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.05), matPlasticoNegro);
    brazo.position.set(-1.7, 1.8, 0.6);
    brazo.rotation.z = -0.3;
    grupo.add(brazo);

    const micro = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.25), new THREE.MeshStandardMaterial({color: 0x555555}));
    micro.position.set(-1.4, 2.1, 0.4);
    micro.rotation.x = Math.PI / 2;
    micro.rotation.z = -0.5;
    grupo.add(micro);

    // 7. AMBILIGHT (Luz trasera)
    const luzGamer = new THREE.PointLight(0xff00ff, 1, 5);
    luzGamer.position.set(0, 2, -0.6);
    grupo.add(luzGamer);

    return grupo;
}


function crearCajaMercancia(grupo, loader, x, y, z) {
    const cajaGroup = new THREE.Group();
    cajaGroup.position.set(x, y, z);

    // Medidas de la caja
    const ancho = 1.5;
    const alto = 0.8;
    const profundo = 1.5;
    const grosor = 0.05; // Grosor del cartón

    // Material Cartón
    const matCaja = new THREE.MeshStandardMaterial({ 
        color: 0xcd853f, // Marrón cartón
        roughness: 0.9 
    });

    // 1. CONSTRUIR LA CAJA (Pared por pared para que sea hueca)
    
    // Fondo
    const fondo = new THREE.Mesh(new THREE.BoxGeometry(ancho, grosor, profundo), matCaja);
    fondo.position.y = grosor / 2;
    cajaGroup.add(fondo);

    // Pared Trasera
    const paredTrasera = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, grosor), matCaja);
    paredTrasera.position.set(0, alto/2, -profundo/2 + grosor/2);
    cajaGroup.add(paredTrasera);

    // Pared Frontal
    const paredFrontal = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, grosor), matCaja);
    paredFrontal.position.set(0, alto/2, profundo/2 - grosor/2);
    cajaGroup.add(paredFrontal);

    // Pared Izquierda
    const paredIzq = new THREE.Mesh(new THREE.BoxGeometry(grosor, alto, profundo - grosor*2), matCaja);
    paredIzq.position.set(-ancho/2 + grosor/2, alto/2, 0);
    cajaGroup.add(paredIzq);

    // Pared Derecha
    const paredDer = new THREE.Mesh(new THREE.BoxGeometry(grosor, alto, profundo - grosor*2), matCaja);
    paredDer.position.set(ancho/2 - grosor/2, alto/2, 0);
    cajaGroup.add(paredDer);

    // 2. SOLAPAS (Abiertas hacia afuera)
    
    // Solapa Frontal
    const solapaF = new THREE.Mesh(new THREE.BoxGeometry(ancho, 0.4, grosor), matCaja);
    solapaF.position.set(0, alto, profundo/2 - grosor/2 + 0.2); // Un poco salida
    solapaF.rotation.x = 0.5; // Abierta 
    cajaGroup.add(solapaF);

    // Solapa Trasera
    const solapaB = new THREE.Mesh(new THREE.BoxGeometry(ancho, 0.4, grosor), matCaja);
    solapaB.position.set(0, alto, -profundo/2 + grosor/2 - 0.2);
    solapaB.rotation.x = -0.5; 
    cajaGroup.add(solapaB);

    // Solapa Izquierda
    const solapaL = new THREE.Mesh(new THREE.BoxGeometry(grosor, 0.4, profundo), matCaja);
    solapaL.position.set(-ancho/2 + grosor/2 - 0.2, alto, 0);
    solapaL.rotation.z = 0.5;
    cajaGroup.add(solapaL);

    // Solapa Derecha
    const solapaR = new THREE.Mesh(new THREE.BoxGeometry(grosor, 0.4, profundo), matCaja);
    solapaR.position.set(ancho/2 - grosor/2 + 0.2, alto, 0);
    solapaR.rotation.z = -0.5;
    cajaGroup.add(solapaR);

    grupo.add(cajaGroup);

    // 3. LLENARLA DE GORRAS
    loader.load('./modelos/gorra.glb', (gltf) => {
        const gorraOriginal = gltf.scene;
        gorraOriginal.scale.set(0.005, 0.005, 0.005);

        for(let i=0; i<8; i++) { // 8 gorras
            const gorra = gorraOriginal.clone();
            
            // Posición aleatoria DENTRO de la caja
            gorra.position.set(
                x + (Math.random() - 0.5) * 1.0, 
                y + (Math.random() * 0.5) + 0.2, // Altura variable
                z + (Math.random() - 0.5) * 1.0
            );
            
            // Rotación loca (tiradas)
            gorra.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3);
            
            // Colores variados
            gorra.traverse(c => {
                if(c.isMesh) {
                    c.material = c.material.clone();
                    c.material.color.setHex(Math.random() * 0xffffff);
                }
            });
            grupo.add(gorra);
        }
    });
}

function crearBotonRegresar(grupo, loader, interactables) {
    const contenedor = new THREE.Group();
    // Posición: Pared TRASERA, a nivel del suelo
    contenedor.position.set(0, 0, 5.5); 
    contenedor.rotation.y = Math.PI; 
    grupo.add(contenedor);

    // --- 1. EL PEDESTAL ---
    const geoBase = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 32);
    const matBase = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 }); 
    const base = new THREE.Mesh(geoBase, matBase);
    base.position.y = 0.6; 
    contenedor.add(base);

    const geoTope = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 32);
    const matTope = new THREE.MeshBasicMaterial({ color: 0xff0000 }); 
    const tope = new THREE.Mesh(geoTope, matTope);
    tope.position.y = 1.22; 
    contenedor.add(tope);

    const luz = new THREE.PointLight(0xff0000, 1, 3);
    luz.position.set(0, 1.5, 0);
    contenedor.add(luz);

    // --- 2. LA GORRA (Botón) ---
    loader.load('./modelos/gorra.glb', (gltf) => {
        const boton = gltf.scene;
        // Escala pequeña para la gorra
        boton.scale.set(0.005, 0.005, 0.005); 
        boton.position.set(0, 1.6, 0); 
        
        boton.name = "boton_regresar";
        boton.traverse(c => { if(c.isMesh) c.name = "boton_regresar"; });
        
        contenedor.add(boton);
        interactables.push(boton);

        // Animación de la gorra
        const animar = () => { 
            requestAnimationFrame(animar); 
            boton.rotation.y -= 0.02; 
            boton.position.y = 1.6 + Math.sin(Date.now() * 0.003) * 0.1;
        }; 
        animar();
    });

    // --- 3. TEXTO "REGRESAR" (Independiente de la gorra) ---
    const loaderFont = new FontLoader();
    loaderFont.load('./font/helvetiker.json', (font) => {
        // Tamaño normal (ya no necesita ser gigante porque no hereda la escala 0.005)
        const geo = new TextGeometry("REGRESAR", { 
            font: font, 
            size: 0.25, // Tamaño normal
            height: 0.05 
        });
        geo.center(); 
        
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        
        // Posición flotando encima del pedestal (ajustada a escala normal)
        mesh.position.set(0, 2.2, 0); 
        
        // ¡IMPORTANTE! Agregamos el texto al CONTENEDOR, NO a la gorra
        contenedor.add(mesh);
        
        // Opcional: Animar el texto también
        let time = 0;
        const animarTexto = () => {
             requestAnimationFrame(animarTexto);
             time += 0.02;
             mesh.position.y = 2.2 + Math.sin(time) * 0.05;
        };
        animarTexto();
    });

    // --- 4. FLECHAS ---
    const fSig = crearFlechaShape();
    fSig.position.set(2, 2.5, 0); fSig.rotation.z = -Math.PI/2;
    fSig.name = "flecha_siguiente_atras"; 
    contenedor.add(fSig); interactables.push(fSig);

    const fAnt = crearFlechaShape();
    fAnt.position.set(-2, 2.5, 0); fAnt.rotation.z = Math.PI/2;
    fAnt.name = "flecha_anterior_atras"; 
    contenedor.add(fAnt); interactables.push(fAnt);

}






