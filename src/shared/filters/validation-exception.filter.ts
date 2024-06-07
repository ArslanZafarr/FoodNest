import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    BadRequestException,
    Logger,
} from '@nestjs/common';

@Catch(BadRequestException) // Only catch BadRequestException
export class ValidationExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ValidationExceptionFilter.name);

    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const errorResponse = exception.getResponse();
        const errors = errorResponse['message'];

        this.logger.error(
            `Validation error occurred: ${JSON.stringify(errors)}`,
            exception.stack,
        );

        if (typeof errors === 'object' && errors !== null) {
            const formattedErrors = {};
            Object.keys(errors).forEach((key) => {
                formattedErrors[key] = Object.values(errors[key]);
            });

            response.status(400).json({
                success: false,
                message: 'Validation error occurred',
                errors: formattedErrors,
            });
        } else {
            response.status(400).json({
                success: false,
                message: 'Validation error occurred',
                errors: [errorResponse['error']],
            });
        }
    }
}
