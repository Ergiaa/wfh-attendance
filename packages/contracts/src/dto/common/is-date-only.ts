import { IsISO8601, Matches } from 'class-validator';

export function IsDateOnly(): PropertyDecorator {
  const format = Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '$property must be a YYYY-MM-DD date' });
  const realDate = IsISO8601(
    { strict: true },
    { message: '$property must be a valid calendar date' },
  );
  return (target, propertyKey) => {
    format(target, propertyKey);
    realDate(target, propertyKey);
  };
}
