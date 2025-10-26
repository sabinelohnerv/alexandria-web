/**
 * Tipos de errores estructurados que retorna el backend
 */

export type BackendErrorCode =
    | "database_error"
    | "connection_error"
    | "timeout_error"
    | "internal_error"
    | "validation_error"
    | "content_validation"
    | "not_found"
    | "unauthorized"
    | "forbidden";

export interface BackendErrorResponse {
    detail: string;
    code?: BackendErrorCode;
}

export class BackendError extends Error {
    public readonly statusCode: number;
    public readonly code?: BackendErrorCode;
    public readonly detail: string;

    constructor(statusCode: number, detail: string, code?: BackendErrorCode) {
        super(detail);
        this.name = "BackendError";
        this.statusCode = statusCode;
        this.code = code;
        this.detail = detail;
    }

    /**
     * Retorna un mensaje amigable para el usuario según el tipo de error
     */
    getUserMessage(): string {
        switch (this.code) {
            case "database_error":
                return "Error de base de datos. Por favor, intenta nuevamente en unos momentos.";
            case "connection_error":
                return "Error de conexión con los servicios. Por favor, verifica tu conexión a internet.";
            case "timeout_error":
                return "La solicitud tardó demasiado tiempo. Por favor, intenta nuevamente.";
            case "validation_error":
                return "Los datos enviados no son válidos. Por favor, verifica e intenta nuevamente.";
            case "content_validation":
                // Para validaciones de contenido, usar el mensaje del backend directamente
                return this.detail;
            case "not_found":
                return "El recurso solicitado no fue encontrado.";
            case "unauthorized":
                return "No tienes autorización para realizar esta acción. Por favor, inicia sesión nuevamente.";
            case "forbidden":
                return "No tienes permisos para acceder a este recurso.";
            case "internal_error":
            default:
                return this.detail || "Ocurrió un error inesperado. Por favor, intenta nuevamente.";
        }
    }

    /**
     * Determina si el error es recuperable (el usuario puede reintentar)
     */
    isRetryable(): boolean {
        return ["database_error", "connection_error", "timeout_error"].includes(this.code || "");
    }

    /**
     * Retorna el tipo de alerta apropiado para mostrar en la UI
     */
    getAlertKind(): "error" | "warning" | "info" {
        // Validaciones de contenido son informativas, no errores
        if (this.code === "content_validation") return "info";
        if (this.statusCode >= 500) return "error";
        if (this.statusCode === 401 || this.statusCode === 403) return "warning";
        return "info";
    }

    /**
     * Determina si este es un error técnico o solo una validación de contenido
     */
    isTechnicalError(): boolean {
        return this.code !== "content_validation";
    }
}
