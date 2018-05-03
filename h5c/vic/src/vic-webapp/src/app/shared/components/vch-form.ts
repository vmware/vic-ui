import {FormGroup} from '@angular/forms';
import {camelCasePattern} from '../utils/validators';
import {isUploadableFileObject} from '../utils/model-checker';

export abstract class VchForm {
  form: FormGroup;
  model: any;

  isFormControlInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control.invalid && (control.dirty || control.touched);
  }

  /**
   * Convert camelcase keys into dash-separated ones, remove fields with
   * an empty array, and then return the array joined
   * @returns {string} vic-machine compatible arguments
   */
  toCliArguments(): string {
    const results = [];

    for (const field in this.model) {
      if (!this.model[field]) {
        continue;
      }

      // if there is only one entry in the section and it's of string type
      // add it to results array here
      if (typeof this.model[field] === 'string') {
        if (!this.model[field].trim()) {
          continue;
        }
        results.push(`--${field} ${this.model[field]}`);
        continue;
      }

      for (const key in this.model[field]) {
        if (!(this.model[field][key]) || this.model[field][key] === '0') {
          continue;
        }
        const newKey = key.replace(camelCasePattern, '$1-$2').toLowerCase();
        let value = this.model[field][key];
        if (typeof value === 'string') {
          value = this.escapeSpecialCharsForCLI(value);
          if (!value.trim()) {
            continue;
          }
          results.push(`--${newKey} ${value}`);
        } else if (typeof value === 'boolean') {
          results.push(`--${newKey}`);
        } else {
          // repeat adding multiple, optional fields with the same key
          for (const i in value) {
            if (!value[i] || value[i] === '0') {
              continue;
            }

            const rawValue = value[i];
            if (typeof rawValue === 'string') {
              if (!rawValue.trim()) {
                continue;
              }
              results.push(`--${newKey} ${rawValue}`);
            } else if (typeof rawValue === 'object') {
              if (isUploadableFileObject(rawValue)) {
                results.push(`--${newKey} ${rawValue.name}`);
              } else {
                for (const j in rawValue) {
                  if (!rawValue[j] || rawValue[j] === '0') {
                    continue;
                  }
                  results.push(`--${j.replace(camelCasePattern, '$1-$2').toLowerCase()} ${this.escapeSpecialCharsForCLI(rawValue[j])}`);
                }
              }
            }
          }
        }
      }
    }

    return results.join(' ')
  }

  abstract toApiPayload(): any;

  private escapeSpecialCharsForCLI(text) {
    return text.replace(/([() ])/g, '\\$&');
  }
}
