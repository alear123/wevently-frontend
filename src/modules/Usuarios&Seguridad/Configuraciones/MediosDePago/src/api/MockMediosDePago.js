// MockMediosDePago.js
export const mediosDePagoMock = [
  {
    "id": 1,
    "nombre": "Visa Crédito",
    "esVisible": true,
    "codigo": "VISA_CR",
    "tipo": "TARJETA_CREDITO",
    "estado": "ACTIVO",
    "montoMax": "50000.00",
    "montoMin": "100.00",
    "tiempoAcreditacion": 24
  },
  {
    "id": 2,
    "nombre": "Mastercard Débito",
    "esVisible": true,
    "codigo": "MAST_DEB",
    "tipo": "TARJETA_DEBITO",
    "estado": "ACTIVO",
    "montoMax": "30000.00",
    "montoMin": "50.00",
    "tiempoAcreditacion": 12
  },
  {
    "id": 3,
    "nombre": "Transferencia Bancaria",
    "esVisible": false,
    "codigo": "TRANSFER",
    "tipo": "TRANSFERENCIA",
    "estado": "MANTENIMIENTO",
    "montoMax": "100000.00",
    "montoMin": "500.00",
    "tiempoAcreditacion": 48
  },
  {
    "id": 4,
    "nombre": "Pago Fácil",
    "esVisible": true,
    "codigo": "PAGOFACIL",
    "tipo": "EFECTIVO",
    "estado": "ACTIVO",
    "montoMax": "20000.00",
    "montoMin": "100.00",
    "tiempoAcreditacion": 72
  },
  {
    "id": 5,
    "nombre": "Mercado Pago",
    "esVisible": false,
    "codigo": "MP_WALLET",
    "tipo": "BILLETERA_DIGITAL",
    "estado": "INACTIVO",
    "montoMax": "15000.00",
    "montoMin": "50.00",
    "tiempoAcreditacion": 5
  },
  {
    "id": 6,
    "nombre": "PayPal",
    "esVisible": true,
    "codigo": "PAYPAL",
    "tipo": "BILLETERA_DIGITAL",
    "estado": "ACTIVO",
    "montoMax": "25000.00",
    "montoMin": "200.00",
    "tiempoAcreditacion": 2
  }
];

// Simulador de API calls con delays para hacer más realista
export const mediosDePagoMockAPI = {
  
  
  obtenerMediosDisponibles: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          data: [...mediosDePagoMock] 
        });
      }, 800); 
    });
  },

  
  cambiarVisibilidadMedio: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const medio = mediosDePagoMock.find(m => m.id === id);
        
        if (!medio) {
          reject({ 
            success: false, 
            error: 'Medio de pago no encontrado' 
          });
          return;
        }

        
        const medioActualizado = { 
          ...medio, 
          esVisible: !medio.esVisible 
        };

        
        const index = mediosDePagoMock.findIndex(m => m.id === id);
        mediosDePagoMock[index] = medioActualizado;

        resolve({ 
          success: true, 
          data: medioActualizado 
        });
      }, 600);
    });
  },

  
  sincronizarConProveedor: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        
        const exito = Math.random() > 0.2; 
        
        if (exito) {
          
          const nuevoMedio = {
            id: Date.now(),
            nombre: "Nuevo Método Sincronizado",
            esVisible: false,
            codigo: "NUEVO_SYNC",
            tipo: "BILLETERA_DIGITAL",
            estado: "ACTIVO",
            montoMax: "40000.00",
            montoMin: "150.00",
            tiempoAcreditacion: 6
          };
          
          
          if (!mediosDePagoMock.find(m => m.codigo === nuevoMedio.codigo)) {
            mediosDePagoMock.push(nuevoMedio);
          }
          
          resolve({ success: true });
        } else {
          reject({ 
            success: false, 
            error: 'Error de conexión con MercadoPago' 
          });
        }
      }, 1500); 
    });
  }
};