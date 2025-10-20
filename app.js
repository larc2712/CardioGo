// Funcionalidad para la página de Lectura Guiada
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de lectura guiada
    const generarInformeBtn = document.getElementById('generarInforme');
    if (generarInformeBtn) {
        generarInformeBtn.addEventListener('click', generarInformeECG);
    }

    // Verificar si estamos en la página de comparación de patrones
    const tomarFotoBtn = document.getElementById('tomarFoto');
    if (tomarFotoBtn) {
        tomarFotoBtn.addEventListener('click', activarCamara);
        
        const ecgFile = document.getElementById('ecgFile');
        ecgFile.addEventListener('change', mostrarVistaPrevia);
        
        const subirImagenBtn = document.getElementById('subirImagen');
        subirImagenBtn.addEventListener('click', function() {
            document.getElementById('ecgFile').click();
        });
        
        const analizarECGBtn = document.getElementById('analizarECG');
        analizarECGBtn.addEventListener('click', analizarECG);
    }

    // Verificar si estamos en la página de copiar informe
    const copiarInformeBtn = document.getElementById('copiarInforme');
    if (copiarInformeBtn) {
        copiarInformeBtn.addEventListener('click', copiarInforme);
    }
});

// Función para generar el informe ECG
function generarInformeECG() {
    const bienTomado = document.getElementById('bienTomado').checked ? 'bien tomado' : 'con limitaciones técnicas';
    const ritmo = document.getElementById('ritmo').value || '[no especificado]';
    const frecuencia = document.getElementById('frecuencia').value || '[no especificada]';
    const eje = document.getElementById('eje').value || '[no especificado]';
    const pr = document.getElementById('pr').value || '[no especificado]';
    const ondaP = document.getElementById('ondaP').value || '[no especificada]';
    const qrs = document.getElementById('qrs').value || '[no especificado]';
    const st = document.getElementById('st').value || '[no especificado]';
    const ondaT = document.getElementById('ondaT').value || '[no especificada]';
    const qt = document.getElementById('qt').value || '[no especificado]';
    const alteraciones = document.getElementById('alteraciones').value || 'sin otras alteraciones significativas';

    const informe = `Electrocardiograma ${bienTomado}, con ritmo ${ritmo}, con frecuencia cardíaca de ${frecuencia} lpm, eje ${eje}, intervalo PR ${pr} ms, onda P ${ondaP}, QRS ${qrs} ms, ST ${st}, onda T ${ondaT}, QT ${qt} ms, ${alteraciones}.`;

    document.getElementById('informeECG').textContent = informe;
}

// Función para copiar el informe al portapapeles
function copiarInforme() {
    const informeTexto = document.getElementById('informeECG').textContent;
    navigator.clipboard.writeText(informeTexto)
        .then(() => {
            alert('Informe copiado al portapapeles');
        })
        .catch(err => {
            console.error('Error al copiar: ', err);
            alert('No se pudo copiar el informe');
        });
}

// Función para activar la cámara
function activarCamara() {
    // Verificar si el navegador soporta la API de MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Tu navegador no soporta la captura de imágenes. Por favor, sube una imagen manualmente.');
        return;
    }

    // Crear elementos para la cámara si no existen
    let videoElement = document.getElementById('camaraVideo');
    if (!videoElement) {
        const previewContainer = document.getElementById('previewContainer');
        previewContainer.classList.remove('d-none');
        
        // Crear elemento de video
        videoElement = document.createElement('video');
        videoElement.id = 'camaraVideo';
        videoElement.autoplay = true;
        videoElement.classList.add('img-fluid', 'mb-2');
        
        // Crear botón para capturar
        const captureBtn = document.createElement('button');
        captureBtn.textContent = 'Capturar';
        captureBtn.classList.add('btn', 'btn-success', 'mb-3');
        captureBtn.id = 'captureBtn';
        
        // Agregar elementos al contenedor
        previewContainer.innerHTML = '';
        previewContainer.appendChild(videoElement);
        previewContainer.appendChild(captureBtn);
        
        // Agregar evento al botón de captura
        captureBtn.addEventListener('click', capturarImagen);
    }

    // Solicitar acceso a la cámara
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoElement.srcObject = stream;
        })
        .catch(error => {
            console.error('Error al acceder a la cámara: ', error);
            alert('No se pudo acceder a la cámara. Por favor, sube una imagen manualmente.');
        });
}

// Función para capturar imagen de la cámara
function capturarImagen() {
    const videoElement = document.getElementById('camaraVideo');
    const previewContainer = document.getElementById('previewContainer');
    
    // Crear un canvas para capturar la imagen
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Convertir a imagen
    const imageDataURL = canvas.toDataURL('image/png');
    
    // Detener la transmisión de video
    const stream = videoElement.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    
    // Mostrar la imagen capturada
    previewContainer.innerHTML = '';
    const imgElement = document.createElement('img');
    imgElement.id = 'ecgPreview';
    imgElement.src = imageDataURL;
    imgElement.classList.add('img-fluid', 'border');
    imgElement.alt = 'ECG capturado';
    previewContainer.appendChild(imgElement);
    
    // Habilitar el botón de análisis
    document.getElementById('analizarECG').disabled = false;
}

// Función para mostrar vista previa de imagen subida
function mostrarVistaPrevia(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewContainer = document.getElementById('previewContainer');
            previewContainer.classList.remove('d-none');
            previewContainer.innerHTML = '';
            
            const imgElement = document.createElement('img');
            imgElement.id = 'ecgPreview';
            imgElement.src = e.target.result;
            imgElement.classList.add('img-fluid', 'border');
            imgElement.alt = 'ECG subido';
            previewContainer.appendChild(imgElement);
            
            // Habilitar el botón de análisis
            document.getElementById('analizarECG').disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

// Función para analizar el ECG
function analizarECG() {
    // En una aplicación real, aquí se enviaría la imagen a un servidor para análisis
    // Para esta demo, mostraremos resultados simulados
    
    document.getElementById('resultadoAnalisis').classList.remove('d-none');
    
    // Simular carga
    const listaPatrones = document.getElementById('listaPatrones');
    listaPatrones.innerHTML = '<li>Analizando imagen...</li>';
    
    // Después de 2 segundos, mostrar resultados simulados
    setTimeout(() => {
        listaPatrones.innerHTML = `
            <li><strong>Alta probabilidad (85%):</strong> Ritmo sinusal normal</li>
            <li><strong>Probabilidad media (45%):</strong> Posible hipertrofia ventricular izquierda</li>
            <li><strong>Baja probabilidad (25%):</strong> Alteraciones inespecíficas de la repolarización</li>
        `;
    }, 2000);
}