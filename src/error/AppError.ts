type AppErrorMessage = string | Object;

class AppError {
    private _code: number;
    private _message: AppErrorMessage;

    constructor(code: number, message: AppErrorMessage) {
        this._code = code;
        this._message = message;
    }

    format() {
        return {
            error: {
                code: this._code,
                message: this._message
            }
        }
    }
}

export default AppError;