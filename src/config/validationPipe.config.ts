import { ValidationPipeOptions } from '@nestjs/common';

export const validationPipeConfig: ValidationPipeOptions = {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: true
};