// Configuración
const CLIENT_ID = '68f68ae84adeece5450b0bf5';
const REDIRECT_URI = window.location.origin + '/callback';
const SCOPES = 'read_station';

let chart = null;
let currentDeviceId = null;
let currentModuleId = null;

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Establecer fecha de hoy por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateSelector').value = today;
    document.getElementById('dateSelector').max = today;
});

// Verificar autenticación
function checkAuth() {
    const accessToken = localStorage.getItem('netatmo_access_token');
    const expiresAt = localStorage.getItem('netatmo_expires_at');

    if (accessToken && expiresAt && Date.now() < expiresAt) {
        showDataSection();
        loadStationData();
    } else {
        showLoginSection();
    }
}

// Mostrar sección de login
function showLoginSection() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('dataSection').style.display = 'none';
}

// Mostrar sección de datos
function showDataSection() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dataSection').style.display = 'block';
}

// Login con Netatmo
function login() {
    const authUrl = `https://api.netatmo.com/oauth2/authorize?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `scope=${SCOPES}&` +
        `state=${Math.random().toString(36).substring(7)}`;
    
    window.location.href = authUrl;
}

// Logout
function logout() {
    localStorage.removeItem('netatmo_access_token');
    localStorage.removeItem('netatmo_refresh_token');
    localStorage.removeItem('netatmo_expires_at');
    showLoginSection();
}

// Cargar datos de la estación
async function loadStationData() {
    try {
        const accessToken = localStorage.getItem('netatmo_access_token');
        
        const response = await fetch('https://api.netatmo.com/api/getstationsdata', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener datos de la estación');
        }

        const data = await response.json();
        
        if (data.body && data.body.devices && data.body.devices.length > 0) {
            const device = data.body.devices[0];
            currentDeviceId = device._id;
            
            // Buscar el módulo exterior
            const outdoorModule = device.modules.find(m => m.type === 'NAModule1');
            
            if (outdoorModule) {
                currentModuleId = outdoorModule._id;
                displayCurrentData(device, outdoorModule);
                loadTodayMinMax();
            } else {
                showError('No se encontró el módulo exterior');
            }
        } else {
            showError('No se encontraron estaciones meteorológicas');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
        
        // Si el token expiró, hacer logout
        if (error.message.includes('401')) {
            logout();
        }
    }
}

// Mostrar datos actuales
function displayCurrentData(device, module) {
    document.getElementById('stationName').textContent = device.station_name || 'Mi Estación';
    
    const temp = module.dashboard_data.Temperature;
    document.getElementById('currentTemp').textContent = `${temp.toFixed(1)}°C`;
    
    const lastUpdate = new Date(module.last_seen * 1000);
    document.getElementById('lastUpdate').textContent = 
        `Última actualización: ${lastUpdate.toLocaleString('es-ES')}`;
}

// Cargar mínimas y máximas de hoy
async function loadTodayMinMax() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateBegin = Math.floor(today.getTime() / 1000);
    const dateEnd = Math.floor(Date.now() / 1000);
    
    await loadMinMaxForPeriod(dateBegin, dateEnd);
}

// Cargar mínimas y máximas para un período
async function loadMinMaxForPeriod(dateBegin, dateEnd) {
    try {
        const accessToken = localStorage.getItem('netatmo_access_token');
        
        const url = `https://api.netatmo.com/api/getmeasure?` +
            `device_id=${currentDeviceId}&` +
            `module_id=${currentModuleId}&` +
            `scale=max&` +
            `type=Temperature,min_temp,max_temp&` +
            `date_begin=${dateBegin}&` +
            `date_end=${dateEnd}&` +
            `optimize=false`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener mediciones');
        }

        const data = await response.json();
        
        if (data.body && Object.keys(data.body).length > 0) {
            let minTemp = Infinity;
            let maxTemp = -Infinity;
            let minTime = null;
            let maxTime = null;

            for (const [timestamp, values] of Object.entries(data.body)) {
                const temp = values[0];
                const min = values[1];
                const max = values[2];
                
                if (min < minTemp) {
                    minTemp = min;
                    minTime = new Date(timestamp * 1000);
                }
                if (max > maxTemp) {
                    maxTemp = max;
                    maxTime = new Date(timestamp * 1000);
                }
            }

            document.getElementById('minTemp').textContent = `${minTemp.toFixed(1)}°C`;
            document.getElementById('maxTemp').textContent = `${maxTemp.toFixed(1)}°C`;
            document.getElementById('minTime').textContent = minTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            document.getElementById('maxTime').textContent = maxTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }
    } catch (error) {
        console.error('Error cargando min/max:', error);
    }
}

// Cargar datos históricos
async function loadHistoricalData() {
    const selectedDate = document.getElementById('dateSelector').value;
    if (!selectedDate) return;

    const date = new Date(selectedDate + 'T00:00:00');
    const dateBegin = Math.floor(date.getTime() / 1000);
    const dateEnd = dateBegin + (24 * 60 * 60); // +24 horas

    try {
        const accessToken = localStorage.getItem('netatmo_access_token');
        
        // Obtener datos cada 30 minutos
        const url = `https://api.netatmo.com/api/getmeasure?` +
            `device_id=${currentDeviceId}&` +
            `module_id=${currentModuleId}&` +
            `scale=30min&` +
            `type=Temperature&` +
            `date_begin=${dateBegin}&` +
            `date_end=${dateEnd}&` +
            `optimize=false`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener datos históricos');
        }

        const data = await response.json();
        
        if (data.body && Object.keys(data.body).length > 0) {
            const timestamps = Object.keys(data.body).map(Number);
            const temperatures = Object.values(data.body).map(v => v[0]);
            
            drawChart(timestamps, temperatures);
        } else {
            showError('No hay datos disponibles para esta fecha');
        }

        // También cargar min/max del día seleccionado
        await loadMinMaxForPeriod(dateBegin, dateEnd);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

// Dibujar gráfico
function drawChart(timestamps, temperatures) {
    const ctx = document.getElementById('tempChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    const labels = timestamps.map(ts => {
        const date = new Date(ts * 1000);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    });

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperatura (°C)',
                data: temperatures,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value + '°C';
                        }
                    }
                }
            }
        }
    });
}

// Mostrar error
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}
