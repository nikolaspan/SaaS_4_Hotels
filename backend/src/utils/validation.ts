import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AppError } from './AppError';

export async function validateDto<T extends object>(
  dtoClass: new () => T,
  data: any
): Promise<T> {
  const dtoInstance = plainToClass(dtoClass, data);
  const errors: ValidationError[] = await validate(dtoInstance);

  if (errors.length > 0) {
    const details = errors.map((error) => ({
      field: error.property,
      constraints: error.constraints,
    }));

    throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details);
  }

  return dtoInstance;
}
