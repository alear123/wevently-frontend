import { useEffect } from 'react';

export default function NotificationDropdown() {
  useEffect(() => {
    const bell = document.querySelector('.notification-bell');
    const badge = document.querySelector('.notification-badge');

    if (bell && badge) {
      bell.addEventListener('click', () => {
        setTimeout(() => {
          badge.textContent = '0';
          badge.style.display = 'none';
        }, 1000);
      });
    }
  }, []);

  return (
    <div className="dropdown">
      <div className="notification-bell" data-bs-toggle="dropdown" aria-expanded="false">
        <i className="fas fa-bell"></i>
        <span className="notification-badge">1</span>
      </div>
      <ul className="dropdown-menu dropdown-menu-end notification-dropdown">
        <li className="dropdown-header"><strong>Notificaciones</strong></li>
        {[
          {
            title: 'Nuevo evento disponible',
            text: 'Se ha publicado un nuevo evento en tu área',
            time: 'Hace 2 horas'
          },
          {
            title: 'Recordatorio',
            text: 'Tu evento "Conferencia Tech" es mañana',
            time: 'Hace 1 día'
          },
          {
            title: 'Mensaje recibido',
            text: 'Tienes un nuevo mensaje de un organizador',
            time: 'Hace 2 días'
          }
        ].map((n, idx) => (
          <li key={idx}>
            <div className="notification-item">
              <div className="notification-title">{n.title}</div>
              <div className="notification-text">{n.text}</div>
              <div className="notification-time">{n.time}</div>
            </div>
          </li>
        ))}
        <li><hr className="dropdown-divider" /></li>
        <li><a className="dropdown-item text-center" href="#">Ver todas las notificaciones</a></li>
      </ul>
    </div>
  );
}
