import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const kmRangeValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
        const startKM = Number(control.get('startKM')?.value);
        const endKMValue = control.get('endKM')?.value;
        if (endKMValue === null || endKMValue === undefined || endKMValue === '') {
            return null;
        }
        const endKM = Number(endKMValue);
        return endKM < startKM ? { invalidKmRange: true } : null;
    };
};