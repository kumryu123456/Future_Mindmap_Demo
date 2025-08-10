export interface KeywordInputProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  onSubmit?: (keywords: string[]) => void;
  placeholder?: string;
  maxKeywords?: number;
  maxKeywordLength?: number;
  minKeywordLength?: number;
  allowDuplicates?: boolean;
  separators?: string[];
  validation?: {
    required?: boolean;
    minCount?: number;
    maxCount?: number;
    minKeywordLength?: number;
    maxKeywordLength?: number;
    pattern?: RegExp;
    customValidator?: (keyword: string) => string | null;
  };
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  inputClassName?: string;
  keywordClassName?: string;
  errorClassName?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;
}

export interface KeywordInputState {
  inputValue: string;
  keywords: string[];
  errors: string[];
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
}

export interface KeywordValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface KeywordInputMethods {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  validate: () => KeywordValidationResult;
  reset: () => void;
}

export interface UseKeywordInputProps {
  initialKeywords?: string[];
  validation?: {
    required?: boolean;
    minCount?: number;
    maxCount?: number;
    minKeywordLength?: number;
    maxKeywordLength?: number;
    pattern?: RegExp;
    customValidator?: (keyword: string) => string | null;
  };
  maxKeywords?: number;
  allowDuplicates?: boolean;
  separators?: string[];
  onChange?: (keywords: string[]) => void;
  onSubmit?: (keywords: string[]) => void;
}

export interface UseKeywordInputReturn extends KeywordInputState {
  methods: KeywordInputMethods;
  handlers: {
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onInputBlur: () => void;
    onInputFocus: () => void;
    onKeywordRemove: (keyword: string) => void;
    onSubmit: (e?: React.FormEvent) => void;
  };
  refs: {
    inputRef: React.RefObject<HTMLInputElement>;
  };
}

export interface KeywordTagProps {
  keyword: string;
  onRemove: (keyword: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  'aria-label'?: string;
}