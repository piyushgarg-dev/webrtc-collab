import AppError from "./AppError";

class PermissionError extends AppError {
    constructor() {
        super(403, "Permission Error");
    }
}

export default PermissionError;