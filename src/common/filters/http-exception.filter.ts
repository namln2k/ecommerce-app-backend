import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ErrorResponse } from '../../common/interfaces/error-response.interface';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { statusCode, message, error } = this.parseException(exception);

    const errorResponse: ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    // Log full detail server-side; client only gets the shaped response above
    this.logger.error(
      `${request.method} ${request.url} -> ${statusCode}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(statusCode).json(errorResponse);
  }

  private parseException(exception: unknown): {
    statusCode: number;
    message: string | string[];
    error: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      // class-validator's ValidationPipe throws a BadRequestException whose
      // getResponse() is an object like { message: string[], error: 'Bad Request' }
      if (typeof res === 'object' && res !== null) {
        const resObj = res as { message?: string | string[]; error?: string };
        return {
          statusCode: status,
          message: resObj.message ?? exception.message,
          error: resObj.error ?? HttpStatus[status],
        };
      }

      return {
        statusCode: status,
        message: exception.message,
        error: HttpStatus[status],
      };
    }

    // Unknown/unhandled exception — never leak internals to the client
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }
}
