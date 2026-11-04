import { useState, useEffect } from "react";

export function useFacturaPdf(datosFactura, dominio) {
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        if (!datosFactura) return;
        console.log("fetch PDF llamado")

        const fetchPdf = async () => {
            const response = await fetch(`${dominio}/api/factura/crear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosFactura)
            });
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        };
        fetchPdf();

        // Limpia el blob al desmontar para no perder memoria
        return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    }, [datosFactura, dominio]);

    return pdfUrl;
}
