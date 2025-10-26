/**
 * Supresor de logs de errores de validación de contenido
 * Intercepta console.error para evitar que se muestren validaciones de contenido como errores
 */

let originalConsoleError: typeof console.error;

export function setupErrorSuppressor() {
    if (typeof window === "undefined") return;
    
    // Guardar referencia original
    if (!originalConsoleError) {
        originalConsoleError = console.error;
    }
    
    // Interceptar console.error
    console.error = (...args: any[]) => {
        // Detectar si es un error de validación de contenido
        const errorString = args.join(" ");
        
        // Suprimir si contiene el mensaje de validación de contenido
        if (errorString.includes("consultas jurídicas")) {
            return; // No loguear
        }
        
        // Para otros errores, usar el console.error original
        originalConsoleError.apply(console, args);
    };
}

export function restoreConsoleError() {
    if (originalConsoleError) {
        console.error = originalConsoleError;
    }
}
