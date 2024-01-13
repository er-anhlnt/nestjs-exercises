import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'sort-fields' })
export class SortedFields implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    if (
      !args.constraints ||
      !args.constraints[0] ||
      typeof args.constraints[0] !== 'object'
    ) {
      return false;
    }

    // allowFields is a enum of fields
    const allowFields = args.constraints[0];

    if (value in allowFields || value.replace('-', '') in allowFields) {
      return true;
    }

    return false;
  }

  defaultMessage() {
    return 'Invalid sort fields';
  }
}
