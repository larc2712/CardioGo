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
        
        const enviarChatGPTBtn = document.getElementById('enviarChatGPT');
        if (enviarChatGPTBtn) {
            enviarChatGPTBtn.addEventListener('click', enviarAChatGPT);
        }
        
        const buscarImagenesSimilaresBtn = document.getElementById('buscarImagenesSimilares');
        if (buscarImagenesSimilaresBtn) {
            buscarImagenesSimilaresBtn.addEventListener('click', buscarImagenesSimilares);
        }
        
        const guardarAnalisisPDFBtn = document.getElementById('guardarAnalisisPDF');
        if (guardarAnalisisPDFBtn) {
            guardarAnalisisPDFBtn.addEventListener('click', guardarAnalisisPDF);
        }
    }

    // Compatibilidad con la nueva versión de "Comparación de Patrones" (IDs V2)
    const ecgFileInput = document.getElementById('ecgFileInput');
    const btnCapturar = document.getElementById('btnCapturar');
    if (btnCapturar && ecgFileInput) {
        btnCapturar.addEventListener('click', capturarDesdeArchivoV2);

        const btnLimpiarCaptura = document.getElementById('btnLimpiarCaptura');
        if (btnLimpiarCaptura) btnLimpiarCaptura.addEventListener('click', limpiarCapturaV2);

        const btnAnalisisLocal = document.getElementById('btnAnalisisLocal');
        if (btnAnalisisLocal) btnAnalisisLocal.addEventListener('click', analizarECG_V2);

        const btnAnalisisChatGPT = document.getElementById('btnAnalisisChatGPT');
        if (btnAnalisisChatGPT) btnAnalisisChatGPT.addEventListener('click', enviarAChatGPT_V2);

        const btnAnalisisSimilares = document.getElementById('btnAnalisisSimilares');
        if (btnAnalisisSimilares) btnAnalisisSimilares.addEventListener('click', buscarImagenesSimilares_V2);

        const savePdfBtn = document.getElementById('savePdfBtn');
        if (savePdfBtn) savePdfBtn.addEventListener('click', guardarAnalisisPDF);
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
    
    // Habilitar todos los botones de análisis
    document.getElementById('analizarECG').disabled = false;
    document.getElementById('enviarChatGPT').disabled = false;
    document.getElementById('buscarImagenesSimilares').disabled = false;
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
            
            // Habilitar todos los botones de análisis
            document.getElementById('analizarECG').disabled = false;
            document.getElementById('enviarChatGPT').disabled = false;
            document.getElementById('buscarImagenesSimilares').disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

// Función para analizar el ECG
function analizarECG() {
    // En una aplicación real, aquí se enviaría la imagen a un servidor para análisis
    // Para esta demo, mostraremos resultados simulados
    
    document.getElementById('resultadoAnalisis').classList.remove('d-none');
    document.getElementById('chatGPTAnalisis').classList.add('d-none');
    document.getElementById('imagenesEncontradas').classList.add('d-none');
    
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

// Función para enviar la imagen a ChatGPT para análisis
function enviarAChatGPT() {
    // Mostrar el contenedor de análisis de ChatGPT
    document.getElementById('chatGPTAnalisis').classList.remove('d-none');
    document.getElementById('resultadoAnalisis').classList.add('d-none');
    document.getElementById('imagenesEncontradas').classList.add('d-none');
    
    // En una aplicación real, aquí se enviaría la imagen a la API de ChatGPT
    // Para esta demo, mostraremos resultados simulados
    
    // Simular carga
    const chatGPTRespuesta = document.getElementById('chatGPTRespuesta');
    chatGPTRespuesta.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <p>Consultando a ChatGPT...</p>
    `;
    
    // Después de 3 segundos, mostrar resultados simulados
    setTimeout(() => {
        const respuestaSimulada = `
            <h5>Análisis del ECG:</h5>
            <p>Basado en la imagen proporcionada, este ECG muestra un <strong>ritmo sinusal normal</strong> con una frecuencia cardíaca de aproximadamente 75 latidos por minuto.</p>
            
            <h5>Características observadas:</h5>
            <ul>
                <li>Ritmo regular con ondas P presentes antes de cada complejo QRS</li>
                <li>Intervalo PR normal (aproximadamente 160 ms)</li>
                <li>Duración del QRS normal (aproximadamente 90 ms)</li>
                <li>No hay elevación o depresión significativa del segmento ST</li>
                <li>Ondas T de morfología normal</li>
                <li>No hay signos de hipertrofia ventricular</li>
            </ul>
            
            <h5>Interpretación:</h5>
            <p>Este ECG se considera dentro de los límites normales sin evidencia de patología cardíaca significativa. Recomendaría correlacionar estos hallazgos con la historia clínica y el examen físico del paciente.</p>
            
            <button type="button" class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#chatGPTModal">
                Ver análisis completo
            </button>
        `;
        
        chatGPTRespuesta.innerHTML = respuestaSimulada;
        
        // También actualizar el contenido del modal
        document.getElementById('chatGPTModalContent').innerHTML = respuestaSimulada + `
            <h5 class="mt-4">Diagnóstico diferencial:</h5>
            <ul>
                <li>ECG normal</li>
                <li>Variante normal</li>
                <li>Posibles cambios no específicos que requieren correlación clínica</li>
            </ul>
            
            <h5>Recomendaciones:</h5>
            <ul>
                <li>Si el paciente está asintomático y este es un ECG de rutina, no se requieren más estudios.</li>
                <li>Si el paciente presenta síntomas cardíacos, considerar evaluación adicional según la presentación clínica.</li>
                <li>Seguimiento regular según factores de riesgo cardiovascular del paciente.</li>
            </ul>
            
            <div class="alert alert-info mt-3">
                <strong>Nota:</strong> Este análisis es generado por IA y no sustituye la interpretación de un profesional médico calificado. Siempre consulte con un cardiólogo para la interpretación definitiva de un ECG.
            </div>
        `;
    }, 3000);
}

// Función para buscar imágenes similares
function buscarImagenesSimilares() {
    // Mostrar el contenedor de imágenes encontradas
    document.getElementById('imagenesEncontradas').classList.remove('d-none');
    document.getElementById('resultadoAnalisis').classList.add('d-none');
    document.getElementById('chatGPTAnalisis').classList.add('d-none');
    
    // En una aplicación real, aquí se enviaría la imagen a un servicio de búsqueda de imágenes
    // Para esta demo, mostraremos resultados simulados
    
    const galeriaImagenes = document.getElementById('galeriaImagenes');
    galeriaImagenes.innerHTML = `
        <div class="col-12 text-center mb-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Buscando imágenes similares...</span>
            </div>
            <p>Buscando imágenes similares en la web...</p>
        </div>
    `;
    
    // Después de 3 segundos, mostrar resultados simulados
    setTimeout(() => {
        galeriaImagenes.innerHTML = `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <img src="https://litfl.com/wp-content/uploads/2018/08/normal-sinus-rhythm-ecg.jpg" class="card-img-top" alt="ECG similar 1">
                    <div class="card-body">
                        <h5 class="card-title">Ritmo sinusal normal</h5>
                        <p class="card-text">Coincidencia: 92%</p>
                        <a href="https://litfl.com/normal-sinus-rhythm-ecg-library/" class="btn btn-primary btn-sm" target="_blank">Ver fuente</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card">
                    <img src="https://litfl.com/wp-content/uploads/2018/08/ECG-Sinus-bradycardia.jpg" class="card-img-top" alt="ECG similar 2">
                    <div class="card-body">
                        <h5 class="card-title">Bradicardia sinusal</h5>
                        <p class="card-text">Coincidencia: 78%</p>
                        <a href="https://litfl.com/sinus-bradycardia-ecg-library/" class="btn btn-primary btn-sm" target="_blank">Ver fuente</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card">
                    <img src="https://litfl.com/wp-content/uploads/2018/08/ECG-Left-bundle-branch-block-LBBB.jpg" class="card-img-top" alt="ECG similar 3">
                    <div class="card-body">
                        <h5 class="card-title">Bloqueo de rama izquierda</h5>
                        <p class="card-text">Coincidencia: 65%</p>
                        <a href="https://litfl.com/left-bundle-branch-block-lbbb-ecg-library/" class="btn btn-primary btn-sm" target="_blank">Ver fuente</a>
                    </div>
                </div>
            </div>
            <div class="col-12">
                <div class="alert alert-warning">
                    <strong>Nota:</strong> Las imágenes mostradas son solo ejemplos y no representan un diagnóstico médico. Consulte siempre con un profesional de la salud para la interpretación correcta de un ECG.
                </div>
            </div>
        `;
    }, 3000);
}

// Función para guardar el análisis como PDF
function guardarAnalisisPDF() {
    // En una aplicación real, aquí se generaría un PDF con el análisis
    // Para esta demo, mostraremos un mensaje de simulación
    alert('Funcionalidad de guardar como PDF simulada. En una aplicación real, se generaría un PDF con el análisis completo.');
}

// Funciones V2 para la nueva versión de "Comparación de Patrones"
function capturarDesdeArchivoV2() {
    const fileInput = document.getElementById('ecgFileInput');
    const file = fileInput && fileInput.files[0];
    if (!file) {
        alert('Selecciona una imagen de ECG desde el selector.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewContainer = document.getElementById('vistaPrevia');
        if (!previewContainer) return;
        previewContainer.classList.remove('d-none');
        previewContainer.innerHTML = '';
        const imgElement = document.createElement('img');
        imgElement.id = 'ecgPreview';
        imgElement.src = e.target.result;
        imgElement.classList.add('img-fluid', 'border');
        imgElement.alt = 'ECG subido';
        previewContainer.appendChild(imgElement);
        ['btnAnalisisLocal', 'btnAnalisisChatGPT', 'btnAnalisisSimilares'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = false;
        });
    };
    reader.readAsDataURL(file);
}

function limpiarCapturaV2() {
    const previewContainer = document.getElementById('vistaPrevia');
    if (previewContainer) {
        previewContainer.classList.add('d-none');
        previewContainer.innerHTML = '';
    }
    ['btnAnalisisLocal', 'btnAnalisisChatGPT', 'btnAnalisisSimilares'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });
    ['resultadoLocal', 'resultadoChatGPT', 'resultadoSimilares'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('d-none');
    });
}

function analizarECG_V2() {
    const resultadoLocal = document.getElementById('resultadoLocal');
    const resultadoChatGPT = document.getElementById('resultadoChatGPT');
    const resultadoSimilares = document.getElementById('resultadoSimilares');
    if (resultadoLocal) {
        resultadoLocal.classList.remove('d-none');
        resultadoLocal.innerHTML = '<div class="alert alert-secondary">Analizando imagen...</div>';
    }
    if (resultadoChatGPT) resultadoChatGPT.classList.add('d-none');
    if (resultadoSimilares) resultadoSimilares.classList.add('d-none');
    setTimeout(() => {
        if (resultadoLocal) {
            resultadoLocal.innerHTML = `
                <ul class="mb-0">
                    <li><strong>Alta probabilidad (85%):</strong> Ritmo sinusal normal</li>
                    <li><strong>Probabilidad media (45%):</strong> Posible hipertrofia ventricular izquierda</li>
                    <li><strong>Baja probabilidad (25%):</strong> Alteraciones inespecíficas de la repolarización</li>
                </ul>
            `;
        }
    }, 2000);
}

function enviarAChatGPT_V2() {
    const resultadoLocal = document.getElementById('resultadoLocal');
    const resultadoChatGPT = document.getElementById('resultadoChatGPT');
    const resultadoSimilares = document.getElementById('resultadoSimilares');
    if (resultadoChatGPT) {
        resultadoChatGPT.classList.remove('d-none');
        resultadoChatGPT.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Consultando a ChatGPT...</p>
            </div>
        `;
    }
    if (resultadoLocal) resultadoLocal.classList.add('d-none');
    if (resultadoSimilares) resultadoSimilares.classList.add('d-none');

    setTimeout(() => {
        const resumen = `
            <h5>Análisis del ECG:</h5>
            <p>Basado en la imagen proporcionada, este ECG muestra un <strong>ritmo sinusal normal</strong> con una frecuencia cardíaca de aproximadamente 75 latidos por minuto.</p>
            <h5>Características observadas:</h5>
            <ul>
                <li>Ondas P antes de cada QRS</li>
                <li>Intervalo PR normal (~160 ms)</li>
                <li>Duración del QRS normal (~90 ms)</li>
                <li>Sin cambios significativos del ST</li>
                <li>Ondas T de morfología normal</li>
            </ul>
            <h5>Interpretación:</h5>
            <p>ECG dentro de límites normales. Correlacionar con clínica.</p>
            <button type="button" class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#chatGPTModal">Ver análisis completo</button>
        `;
        if (resultadoChatGPT) resultadoChatGPT.innerHTML = resumen;
        const modalBody = document.getElementById('chatGPTModalBody');
        if (modalBody) {
            modalBody.innerHTML = resumen + `
                <h5 class="mt-4">Diagnóstico diferencial:</h5>
                <ul>
                    <li>ECG normal</li>
                    <li>Variante normal</li>
                    <li>Cambios inespecíficos</li>
                </ul>
                <h5>Recomendaciones:</h5>
                <ul>
                    <li>Si es de rutina y asintomático, sin estudios adicionales.</li>
                    <li>Si hay síntomas, evaluar según presentación clínica.</li>
                    <li>Seguimiento según riesgos cardiovasculares.</li>
                </ul>
                <div class="alert alert-info mt-3">
                    <strong>Nota:</strong> Análisis generado por IA. No sustituye evaluación médica.
                </div>
            `;
        }
    }, 3000);
}

function buscarImagenesSimilares_V2() {
    const resultadoLocal = document.getElementById('resultadoLocal');
    const resultadoChatGPT = document.getElementById('resultadoChatGPT');
    const resultadoSimilares = document.getElementById('resultadoSimilares');
    if (resultadoSimilares) {
        resultadoSimilares.classList.remove('d-none');
        resultadoSimilares.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Buscando imágenes similares...</span>
                </div>
                <p class="mt-2">Buscando patrones similares...</p>
            </div>
        `;
    }
    if (resultadoLocal) resultadoLocal.classList.add('d-none');
    if (resultadoChatGPT) resultadoChatGPT.classList.add('d-none');

    setTimeout(() => {
        if (resultadoSimilares) {
            resultadoSimilares.innerHTML = `
                <div class="alert alert-warning">
                    <strong>Resultados simulados:</strong>
                    <ul class="mb-0">
                        <li>Ritmo sinusal normal — coincidencia 92%</li>
                        <li>Bradicardia sinusal — coincidencia 78%</li>
                        <li>Bloqueo de rama izquierda — coincidencia 65%</li>
                    </ul>
                </div>
            `;
        }
    }, 3000);
}