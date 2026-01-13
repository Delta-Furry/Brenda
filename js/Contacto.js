import * as THREE from 'three';
import { FontLoader } from './FontLoader.js';
import { TextGeometry } from './TextGeometry.js';

// --- ESTA ES LA FUNCIÓN QUE FALTABA PARA QUE FUNCIONE EL CELULAR CURVO ---
function getRoundedRectShape(width, height, radius) {
    const shape = new THREE.Shape();
    const x = -width / 2, y = -height / 2;
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    return shape;
}

export function cargarContacto(scene, interactables) {
    const contactoGroup = new THREE.Group();
    // Posición segura en el espacio
    contactoGroup.position.set(200, 0, 0); 

    // --- 1. ENTORNO ---
    const gridHelper = new THREE.GridHelper(40, 40, 0x0088ff, 0x111111);
    gridHelper.position.y = -4;
    contactoGroup.add(gridHelper);
    



// --- 2. EL SMARTPHONE "FLAGSHIP" (CALIDAD PREMIUM) ---
    const phone = new THREE.Group();

    // DIMENSIONES BASE (Para que todo encaje perfecto)
    const ancho = 3.8;
    const alto = 7.6;
    const radio = 0.6;

    // A. CHASIS DE TITANIO (Cuerpo Principal)
    // Usamos 'bevelSegments: 12' para que las curvas sean SÚPER suaves (High Poly)
    const bodyShape = getRoundedRectShape(ancho, alto, radio);
    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, { 
        depth: 0.4, 
        bevelEnabled: true, 
        bevelThickness: 0.1, 
        bevelSize: 0.1, 
        bevelSegments: 12 
    });
    // Material Standard con alto metalness para que brille como metal real
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0x3a3a3a, // Gris Titanio Oscuro
        metalness: 1.0, 
        roughness: 0.4 
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.z = -0.2; // Centrado en profundidad
    phone.add(body);

    // B. BOTONES LATERALES (Geometría Física)
    // Botón Encendido (Derecha)
    const btnPower = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.15), bodyMat);
    btnPower.position.set((ancho/2) + 0.1, 1.5, 0); // Salen del costado
    phone.add(btnPower);
    
    // Botones Volumen (Izquierda)
    const btnVolUp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.15), bodyMat);
    btnVolUp.position.set(-(ancho/2) - 0.1, 2.0, 0);
    phone.add(btnVolUp);
    const btnVolDown = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.15), bodyMat);
    btnVolDown.position.set(-(ancho/2) - 0.1, 1.2, 0);
    phone.add(btnVolDown);

    // C. MÓDULO DE CÁMARA TRASERA (Bump)
    const camBumpGeo = new THREE.BoxGeometry(1.8, 1.8, 0.1);
    const camBump = new THREE.Mesh(camBumpGeo, bodyMat); // Mismo material del cuerpo
    camBump.position.set(0.8, 2.5, -0.25); // En la espalda
    phone.add(camBump);
    
    // Lentes de cámara (3 cilindros negros atrás)
    const lensGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 32);
    const lensMat = new THREE.MeshBasicMaterial({color: 0x000000}); // Negro total
    
    const l1 = new THREE.Mesh(lensGeo, lensMat); l1.rotation.x = Math.PI/2; l1.position.set(0.6, 2.9, -0.35); phone.add(l1);
    const l2 = new THREE.Mesh(lensGeo, lensMat); l2.rotation.x = Math.PI/2; l2.position.set(1.2, 2.3, -0.35); phone.add(l2);
    const l3 = new THREE.Mesh(lensGeo, lensMat); l3.rotation.x = Math.PI/2; l3.position.set(0.6, 2.3, -0.35); phone.add(l3);


    // D. EL BISEL (Marco Negro del Vidrio)
    // Reduce un poco el tamaño para dejar ver el borde de metal
    const bezelShape = getRoundedRectShape(ancho - 0.1, alto - 0.1, radio - 0.05);
    const bezelGeo = new THREE.ShapeGeometry(bezelShape);
    const bezelMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Negro Mate
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.z = 0.31; // Ligeramente enfrente del metal
    phone.add(bezel);

    // E. LA PANTALLA ACTIVA (Display)
    // Más pequeña que el bisel para crear el borde negro realista
    const screenShape = getRoundedRectShape(ancho - 0.3, alto - 0.3, radio - 0.1);
    const screenGeo = new THREE.ShapeGeometry(screenShape);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x111111 }); // Gris Muy Oscuro (Pantalla OLED apagada)
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.32; // 0.01 enfrente del bisel (capas limpias)
    phone.add(screen);

    // F. ISLA DINÁMICA (Cámara Frontal)
    // Usamos Cilindro achatado para máxima compatibilidad y suavidad
    const islandGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.0, 32);
    const islandMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.rotation.z = Math.PI / 2; // Acostado
    island.scale.z = 0.15; // Aplanado
    island.position.set(0, 3.2, 0.33); // Encima de la pantalla
    phone.add(island);

    // G. REFLEJO DE CRISTAL (Sutil y elegante, sin glitches)
    // Solo una línea diagonal muy transparente para dar sensación de vidrio
    const glassGeo = new THREE.PlaneGeometry(0, 0);
    const glassMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.03, // Apenas visible
        side: THREE.FrontSide
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.rotation.z = -0.5;
    glass.position.set(0, 0, 0.33); // Al ras de la isla dinámica
    phone.add(glass);







// --- 3. TEXTOS DE INFORMACIÓN (CORREGIDO: Altura Z subida a 0.35) ---
    const loaderFont = new FontLoader();
    loaderFont.load('./font/helvetiker.json', (font) => {
        
        // Función para crear texto
        const crearTexto = (mensaje, tamano, x, y, color) => {
            const geo = new TextGeometry(mensaje, { font: font, size: tamano, height: 0.01 });
            geo.center();
            const mat = new THREE.MeshBasicMaterial({ color: color }); 
            const mesh = new THREE.Mesh(geo, mat);
            // AQUÍ ESTÁ EL ARREGLO: Z = 0.35 (Para que flote sobre la pantalla)
            mesh.position.set(x, y, 0.35); 
            phone.add(mesh);
        };

        // Encabezado
        crearTexto("CONTACTAME", 0.35, 0, 2.2, 0xffffff);

        // Foto / Iniciales
        const foto = new THREE.Mesh(new THREE.CircleGeometry(0.8, 32), new THREE.MeshBasicMaterial({ color: 0x222222 }));
        foto.position.set(0, 1.0, 0.34); // Z = 0.34
        phone.add(foto);
        crearTexto("BG", 0.5, 0, 1.0, 0xffffff);

        // Nombre y Título
        crearTexto("Brenda Alejandra", 0.3, 0, -0.2, 0xffffff);
        crearTexto("Ing. Multimedia", 0.18, 0, -0.6, 0xaaaaaa);

        // Datos de Contacto
        crearTexto("55 3448 3410", 0.22, 0, -1.5, 0x00ff00); 
        crearTexto("breenscaps@gmail.com", 0.18, 0, -2.0, 0x00ffff); 
        crearTexto("breengarcia0610@gmail.com", 0.18, 0, -2.5, 0xff00ff); 
    });



// --- 4. ICONOS FLOTANTES (DOBLE CARA + CORRECCIÓN DE GIRO) ---
    const appsGroup = new THREE.Group();
    appsGroup.position.z = 0.5; 

    // --- A. WHATSAPP (Doble Cara) ---
    const whatsGroup = new THREE.Group();
    
    // Base Verde
    const wBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32), 
        new THREE.MeshStandardMaterial({color: 0x25D366, roughness: 0.2})
    );
    wBase.rotation.x = Math.PI / 2; 
    whatsGroup.add(wBase);

    // Colita (Triángulo)
    const wTail = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 3), new THREE.MeshStandardMaterial({color: 0x25D366, roughness: 0.2}));
    wTail.position.set(-0.25, -0.28, 0); 
    wTail.rotation.z = -Math.PI / 3;
    whatsGroup.add(wTail);

    // Teléfono (Auricular) - CARA FRONTAL
    const phoneGeo = new THREE.TorusGeometry(0.2, 0.06, 8, 32, 2.8);
    const phoneMat = new THREE.MeshBasicMaterial({color: 0xffffff});
    
    const wPhoneFront = new THREE.Mesh(phoneGeo, phoneMat);
    wPhoneFront.position.set(0.02, 0.05, 0.06); // Adelante
    wPhoneFront.rotation.z = 2.0;
    whatsGroup.add(wPhoneFront);

    // Teléfono (Auricular) - CARA TRASERA (Para que se vea al girar)
    const wPhoneBack = new THREE.Mesh(phoneGeo, phoneMat);
    wPhoneBack.position.set(0.02, 0.05, -0.06); // Atrás
    wPhoneBack.rotation.z = 2.0;
    wPhoneBack.rotation.y = Math.PI; // Volteado
    whatsGroup.add(wPhoneBack);

    whatsGroup.position.set(2.8, 1.0, 0);
    appsGroup.add(whatsGroup);


    // --- B. GMAIL (Doble Cara) ---
    const mailGroup = new THREE.Group();

    // Cuerpo Blanco
    const mBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.1), new THREE.MeshStandardMaterial({color: 0xffffff}));
    mailGroup.add(mBody);

    // Función para poner la M en ambos lados
    const crearM = (zPos) => {
        const redMat = new THREE.MeshBasicMaterial({color: 0xEA4335});
        const groupM = new THREE.Group();

        // Barras de la M
        const mLeft = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.02), redMat);
        mLeft.position.set(-0.18, 0.1, 0); mLeft.rotation.z = -0.6; groupM.add(mLeft);

        const mRight = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.02), redMat);
        mRight.position.set(0.18, 0.1, 0); mRight.rotation.z = 0.6; groupM.add(mRight);

        // Bordes
        const mSideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.02), redMat);
        mSideL.position.set(-0.36, 0, 0); groupM.add(mSideL);

        const mSideR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.02), redMat);
        mSideR.position.set(0.36, 0, 0); groupM.add(mSideR);

        groupM.position.z = zPos;
        mailGroup.add(groupM);
    };

    crearM(0.06);  // Frente
    crearM(-0.06); // Atrás

    mailGroup.position.set(-2.8, -1.0, 0);
    mailGroup.rotation.z = 0.2;
    appsGroup.add(mailGroup);


    // --- C. MAPS (Doble Cara + Corrección de Orientación) ---
    const mapGroup = new THREE.Group();
    const pinMat = new THREE.MeshStandardMaterial({color: 0x4285F4, roughness: 0.3});

    // Cabeza
    const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), pinMat);
    mapGroup.add(pinHead);

    // Punta (Construida hacia abajo directamente para no rotar el grupo)
    const pinTip = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.6, 32), pinMat);
    pinTip.position.y = -0.25; 
    pinTip.rotation.x = Math.PI; // Punta abajo
    mapGroup.add(pinTip);

    // Agujero Negro (Frente)
    const holeGeo = new THREE.CircleGeometry(0.12, 32);
    const holeMat = new THREE.MeshBasicMaterial({color: 0x111111});
    
    const pinHoleFront = new THREE.Mesh(holeGeo, holeMat);
    pinHoleFront.position.z = 0.33; // Frente
    mapGroup.add(pinHoleFront);

    // Agujero Negro (Atrás)
    const pinHoleBack = new THREE.Mesh(holeGeo, holeMat);
    pinHoleBack.position.z = -0.33; // Atrás
    pinHoleBack.rotation.y = Math.PI; // Mirando atrás
    mapGroup.add(pinHoleBack);

    mapGroup.position.set(0, 4.2, -1.5);
    appsGroup.add(mapGroup);

    phone.add(appsGroup);
    
    // Agregamos el teléfono al grupo
    contactoGroup.add(phone);



    
    // --- 5. LUCES ---
    const luzFrontal = new THREE.DirectionalLight(0xffffff, 1.5);
    luzFrontal.position.set(0, 0, 10);
    contactoGroup.add(luzFrontal);

    const luzAmb = new THREE.AmbientLight(0xffffff, 0.5);
    contactoGroup.add(luzAmb);


// --- 6. BOTÓN SALIR (AHORA ARRIBA) ---
    const btnGeo = new THREE.BoxGeometry(2.5, 0.6, 0.2);
    const btnMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Rojo plano
    const btnSalir = new THREE.Mesh(btnGeo, btnMat);
    
    // CAMBIO DE POSICIÓN: 
    // Y = 5.5 (Para que esté flotando bien arriba del celular)
    // Z = 0 (Centrado)
    btnSalir.position.set(0, 5.5, 0);
    btnSalir.name = "btn_contacto_salir";
    
    contactoGroup.add(btnSalir);
    interactables.push(btnSalir); 

    // Texto del botón
    loaderFont.load('./font/helvetiker.json', (font) => {
        const geoSalir = new TextGeometry("VOLVER AL HUB", { font: font, size: 0.25, height: 0.02 });
        geoSalir.center();
        const txtSalir = new THREE.Mesh(geoSalir, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        
        // El texto también sube a Y = 5.5
        txtSalir.position.set(0, 5.5, 0.15); // Z=0.15 para que se vea delante del botón rojo
        contactoGroup.add(txtSalir);
    });



    // --- 7. ANIMACIÓN ---
    const animar = () => {
        requestAnimationFrame(animar);
        // Movimiento suave del celular
        phone.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
        phone.position.y = Math.sin(Date.now() * 0.0015) * 0.2;
        // Apps girando
        appsGroup.rotation.y += 0.01;
    };
    animar();

    scene.add(contactoGroup);
}