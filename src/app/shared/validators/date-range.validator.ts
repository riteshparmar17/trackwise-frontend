import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const dateRangeValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
        const fromDate = control.get('fromDate')?.value;
        const toDate = control.get('toDate')?.value;
        if (!fromDate || !toDate) {
            return null;
        }
        if (new Date(fromDate) > new Date(toDate)) {
            return {
                invalidDateRange: true
            };
        }
        return null;
    };
};