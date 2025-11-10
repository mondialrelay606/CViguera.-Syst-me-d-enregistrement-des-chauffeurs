// --- ATENCIÓN: SERVICIO SIMULADO ---
// En una aplicación real, este servicio realizaría una llamada a un backend
// para enviar notificaciones reales por correo electrónico o SMS.

export const notificationService = {
  /**
   * Simula el envío de una notificación a un administrador.
   * @param message El contenido de la notificación.
   */
  sendNotification: (message: string): Promise<void> => {
    return new Promise((resolve) => {
      // Simula una pequeña demora de red
      setTimeout(() => {
        console.log(`[NOTIFICACIÓN ENVIADA]: ${message}`);
        resolve();
      }, 300);
    });
  },
};
