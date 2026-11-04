import React from 'react';

export default function UsuarioPopOverMenu({
    email,
    rol, 
    children,
    open,
    onClose
}) {
    if(!open) return null;

    return(
        <div className="user-popover-menu">
            {/* Header con datos del usuario */}
            <div className="user-popover-header">
                <div className="user-popover-email">{email}</div>
                <div className="user-popover-rol">{rol}</div>
            </div>

            {/* Separador */}
            <div className="user-popover-divider"></div>

            {/* Opciones del menú */}
            <div className="user-popover-options">
                {children}
            </div>
        </div>
    );
}