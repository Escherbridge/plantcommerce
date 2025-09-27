export interface FormFieldConfig {
  id: string;
  type: 
    | 'text' 
    | 'email' 
    | 'password' 
    | 'number' 
    | 'tel' 
    | 'url'
    | 'textarea' 
    | 'select' 
    | 'checkbox' 
    | 'radio' 
    | 'file' 
    | 'date' 
    | 'datetime-local'
    | 'time'
    | 'richtext'
    | 'multifile';
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: any;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customValidation?: (value: any) => string | null;
  };
  // For select, radio
  options?: { value: string; label: string }[];
  // For file uploads
  accept?: string;
  multiple?: boolean;
  dragDrop?: boolean;
  fileHandler?: (files: FileList) => void;
  // For rich text
  richTextConfig?: {
    modules?: any;
    theme?: string;
    placeholder?: string;
  };
  // For layout
  className?: string;
  containerClassName?: string;
  // For conditional rendering
  showWhen?: (formData: any) => boolean;
}

export interface FormStepConfig {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  validation?: (data: any) => { isValid: boolean; errors: Record<string, string> };
}

export interface MultiFormConfig {
  steps: FormStepConfig[];
  onSubmit: (data: any, step?: number) => void | Promise<void>;
  onStepChange?: (currentStep: number, data: any) => void;
  showProgress?: boolean;
  allowBackNavigation?: boolean;
  submitButtonText?: string;
  nextButtonText?: string;
  prevButtonText?: string;
}

export interface FormState {
  data: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  currentStep: number;
}
