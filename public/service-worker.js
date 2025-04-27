// Service Worker para manejar notificaciones push
self.addEventListener('push', function(event) {
  try {
    const data = event.data.json();
    
    const options = {
      body: data.mensaje,
      icon: '/LogoSinFondo.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('OterGas - Subsidio de Gasolina', options)
    );
  } catch (error) {
    console.error('Error en el evento push:', error);
    
    // Mostrar una notificación genérica en caso de error
    event.waitUntil(
      self.registration.showNotification('OterGas - Notificación', {
        body: 'Tienes una notificación nueva',
        icon: '/LogoSinFondo.png'
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});