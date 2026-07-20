import { CustomError } from './CustomError';

export class AppError extends CustomError {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
