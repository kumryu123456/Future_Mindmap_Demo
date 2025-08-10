import { useState, useRef, useCallback, useEffect } from 'react';
import type { 
  UseKeywordInputProps, 
  UseKeywordInputReturn, 
  KeywordInputState,
  KeywordValidationResult 
} from '../types/components';

const DEFAULT_SEPARATORS = [',', ';', 'Enter', 'Tab'];
const DEFAULT_MAX_KEYWORDS = 50;

export const useKeywordInput = (props: UseKeywordInputProps = {}): UseKeywordInputReturn => {
  const {
    initialKeywords = [],
    validation = {},
    maxKeywords = DEFAULT_MAX_KEYWORDS,
    allowDuplicates = false,
    separators = DEFAULT_SEPARATORS,
    onChange,
    onSubmit
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<KeywordInputState>({
    inputValue: '',
    keywords: initialKeywords,
    errors: [],
    isValid: true,
    isDirty: false,
    isTouched: false
  });

  const validateKeyword = useCallback((keyword: string): string[] => {
    const errors: string[] = [];
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      return errors; // Empty keywords are handled elsewhere
    }

    // Length validation
    if (validation.minKeywordLength && trimmedKeyword.length < validation.minKeywordLength) {
      errors.push(`Keyword must be at least ${validation.minKeywordLength} characters long`);
    }

    if (validation.maxKeywordLength && trimmedKeyword.length > validation.maxKeywordLength) {
      errors.push(`Keyword must not exceed ${validation.maxKeywordLength} characters`);
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(trimmedKeyword)) {
      errors.push('Keyword format is invalid');
    }

    // Custom validation
    if (validation.customValidator) {
      const customError = validation.customValidator(trimmedKeyword);
      if (customError) {
        errors.push(customError);
      }
    }

    return errors;
  }, [validation]);

  const validateKeywords = useCallback((keywords: string[]): KeywordValidationResult => {
    const errors: string[] = [];

    // Required validation
    if (validation.required && keywords.length === 0) {
      errors.push('At least one keyword is required');
    }

    // Count validation
    if (validation.minCount && keywords.length < validation.minCount) {
      errors.push(`At least ${validation.minCount} keywords are required`);
    }

    if (validation.maxCount && keywords.length > validation.maxCount) {
      errors.push(`Cannot exceed ${validation.maxCount} keywords`);
    }

    // Individual keyword validation
    keywords.forEach((keyword, index) => {
      const keywordErrors = validateKeyword(keyword);
      keywordErrors.forEach(error => {
        errors.push(`Keyword ${index + 1}: ${error}`);
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [validateKeyword, validation]);

  const updateState = useCallback((updates: Partial<KeywordInputState>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      
      // Auto-validate when keywords change
      if (updates.keywords) {
        const validationResult = validateKeywords(updates.keywords);
        newState.errors = validationResult.errors;
        newState.isValid = validationResult.isValid;
      }

      return newState;
    });
  }, [validateKeywords]);

  const addKeyword = useCallback((keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    setState(prevState => {
      const newKeywords = [...prevState.keywords];

      // Check for duplicates
      if (!allowDuplicates && newKeywords.includes(trimmedKeyword)) {
        return {
          ...prevState,
          errors: ['This keyword already exists'],
          isValid: false
        };
      }

      // Check max keywords limit
      if (newKeywords.length >= maxKeywords) {
        return {
          ...prevState,
          errors: [`Cannot exceed ${maxKeywords} keywords`],
          isValid: false
        };
      }

      // Validate the keyword
      const keywordErrors = validateKeyword(trimmedKeyword);
      if (keywordErrors.length > 0) {
        return {
          ...prevState,
          errors: keywordErrors,
          isValid: false
        };
      }

      newKeywords.push(trimmedKeyword);
      const validationResult = validateKeywords(newKeywords);

      const newState = {
        ...prevState,
        keywords: newKeywords,
        inputValue: '',
        errors: validationResult.errors,
        isValid: validationResult.isValid,
        isDirty: true
      };

      // Call onChange callback
      if (onChange) {
        onChange(newKeywords);
      }

      return newState;
    });
  }, [allowDuplicates, maxKeywords, validateKeyword, validateKeywords, onChange]);

  const removeKeyword = useCallback((keywordToRemove: string) => {
    setState(prevState => {
      const newKeywords = prevState.keywords.filter(k => k !== keywordToRemove);
      const validationResult = validateKeywords(newKeywords);

      const newState = {
        ...prevState,
        keywords: newKeywords,
        errors: validationResult.errors,
        isValid: validationResult.isValid,
        isDirty: true
      };

      // Call onChange callback
      if (onChange) {
        onChange(newKeywords);
      }

      return newState;
    });
  }, [validateKeywords, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Check for separator characters
    const lastChar = value.slice(-1);
    if (separators.includes(lastChar) || separators.includes('Enter')) {
      const keywordToAdd = value.slice(0, -1).trim();
      if (keywordToAdd) {
        addKeyword(keywordToAdd);
        return;
      }
    }

    updateState({ 
      inputValue: value,
      errors: [] // Clear errors when typing
    });
  }, [separators, addKeyword, updateState]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (separators.includes(e.key)) {
      e.preventDefault();
      const keywordToAdd = state.inputValue.trim();
      if (keywordToAdd) {
        addKeyword(keywordToAdd);
      }
    } else if (e.key === 'Backspace' && !state.inputValue && state.keywords.length > 0) {
      // Remove last keyword when backspacing with empty input
      const lastKeyword = state.keywords[state.keywords.length - 1];
      removeKeyword(lastKeyword);
    }
  }, [separators, state.inputValue, state.keywords, addKeyword, removeKeyword]);

  const handleInputBlur = useCallback(() => {
    updateState({ isTouched: true });
    
    // Add current input as keyword if it exists
    const keywordToAdd = state.inputValue.trim();
    if (keywordToAdd) {
      addKeyword(keywordToAdd);
    }
  }, [state.inputValue, addKeyword, updateState]);

  const handleInputFocus = useCallback(() => {
    updateState({ errors: [] }); // Clear errors on focus
  }, [updateState]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Add current input as keyword before submitting
    const keywordToAdd = state.inputValue.trim();
    if (keywordToAdd) {
      addKeyword(keywordToAdd);
    }

    // Validate and submit
    const validationResult = validateKeywords(state.keywords);
    updateState({
      errors: validationResult.errors,
      isValid: validationResult.isValid,
      isDirty: true,
      isTouched: true
    });

    if (validationResult.isValid && onSubmit) {
      onSubmit(state.keywords);
    }
  }, [state.inputValue, state.keywords, addKeyword, validateKeywords, updateState, onSubmit]);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const blur = useCallback(() => {
    inputRef.current?.blur();
  }, []);

  const clear = useCallback(() => {
    updateState({
      inputValue: '',
      keywords: [],
      errors: [],
      isValid: true,
      isDirty: true
    });
    if (onChange) {
      onChange([]);
    }
  }, [updateState, onChange]);

  const reset = useCallback(() => {
    updateState({
      inputValue: '',
      keywords: initialKeywords,
      errors: [],
      isValid: true,
      isDirty: false,
      isTouched: false
    });
    if (onChange) {
      onChange(initialKeywords);
    }
  }, [initialKeywords, updateState, onChange]);

  const validate = useCallback(() => {
    return validateKeywords(state.keywords);
  }, [state.keywords, validateKeywords]);

  // Auto-validate when keywords change
  useEffect(() => {
    const validationResult = validateKeywords(state.keywords);
    if (validationResult.errors.join() !== state.errors.join() || validationResult.isValid !== state.isValid) {
      updateState({
        errors: validationResult.errors,
        isValid: validationResult.isValid
      });
    }
  }, [state.keywords, validateKeywords, state.errors, state.isValid, updateState]);

  return {
    ...state,
    methods: {
      focus,
      blur,
      clear,
      addKeyword,
      removeKeyword,
      validate,
      reset
    },
    handlers: {
      onInputChange: handleInputChange,
      onInputKeyDown: handleInputKeyDown,
      onInputBlur: handleInputBlur,
      onInputFocus: handleInputFocus,
      onKeywordRemove: removeKeyword,
      onSubmit: handleSubmit
    },
    refs: {
      inputRef: inputRef as React.RefObject<HTMLInputElement>
    }
  };
};