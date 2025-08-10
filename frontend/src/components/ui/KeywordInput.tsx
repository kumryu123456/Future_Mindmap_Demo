import React, { forwardRef, useImperativeHandle } from 'react';
import { useKeywordInput } from '../../hooks/useKeywordInput';
import type { KeywordInputProps, KeywordInputMethods, KeywordTagProps } from '../../types/components';

// Keyword Tag Component
const KeywordTag: React.FC<KeywordTagProps> = ({ 
  keyword, 
  onRemove, 
  disabled = false, 
  readOnly = false,
  className = '',
  'aria-label': ariaLabel
}) => {
  const handleRemove = () => {
    if (!disabled && !readOnly) {
      onRemove(keyword);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && !disabled && !readOnly) {
      e.preventDefault();
      onRemove(keyword);
    }
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded-md text-sm font-medium
        bg-blue-100 text-blue-800 border border-blue-200
        dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${readOnly ? 'cursor-default' : 'cursor-pointer'}
        transition-colors duration-200
        ${className}
      `}
      tabIndex={disabled || readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={ariaLabel || `Remove keyword: ${keyword}`}
    >
      <span className="mr-1 select-none">{keyword}</span>
      {!disabled && !readOnly && (
        <button
          type="button"
          onClick={handleRemove}
          className="
            ml-1 p-0.5 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800
            dark:text-blue-300 dark:hover:bg-blue-800 dark:hover:text-blue-100
            focus:outline-none focus:ring-1 focus:ring-blue-500
            transition-colors duration-200
          "
          tabIndex={-1}
          aria-label={`Remove ${keyword}`}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

// Main KeywordInput Component
export const KeywordInput = forwardRef<KeywordInputMethods, KeywordInputProps>(({
  value = [],
  onChange,
  onSubmit,
  placeholder = 'Add keywords...',
  maxKeywords = 50,
  allowDuplicates = false,
  separators = [',', ';', 'Enter', 'Tab'],
  validation,
  disabled = false,
  readOnly = false,
  className = '',
  inputClassName = '',
  keywordClassName = '',
  errorClassName = '',
  'aria-label': ariaLabel = 'Keywords input',
  'aria-describedby': ariaDescribedBy,
  id
}, ref) => {
  const keywordInput = useKeywordInput({
    initialKeywords: value,
    validation,
    maxKeywords,
    allowDuplicates,
    separators,
    onChange,
    onSubmit
  });

  const {
    inputValue,
    keywords,
    errors,
    isValid,
    isDirty,
    isTouched,
    methods,
    handlers,
    refs
  } = keywordInput;

  // Expose methods through ref
  useImperativeHandle(ref, () => methods, [methods]);

  const showErrors = (isDirty || isTouched) && errors.length > 0;
  const inputId = id || `keyword-input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`keyword-input-container ${className}`}>
      <div
        className={`
          relative min-h-[2.5rem] w-full rounded-md border p-2
          bg-white dark:bg-gray-800
          ${showErrors 
            ? 'border-red-300 dark:border-red-600' 
            : 'border-gray-300 dark:border-gray-600'
          }
          ${disabled 
            ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed opacity-60' 
            : 'hover:border-gray-400 dark:hover:border-gray-500'
          }
          focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
          transition-colors duration-200
        `}
        onClick={() => !disabled && methods.focus()}
      >
        {/* Keywords Display */}
        <div className="flex flex-wrap gap-1 mb-1">
          {keywords.map((keyword, index) => (
            <KeywordTag
              key={`${keyword}-${index}`}
              keyword={keyword}
              onRemove={handlers.onKeywordRemove}
              disabled={disabled}
              readOnly={readOnly}
              className={keywordClassName}
              aria-label={`Keyword ${index + 1} of ${keywords.length}: ${keyword}`}
            />
          ))}
        </div>

        {/* Input Field */}
        <input
          ref={refs.inputRef}
          id={inputId}
          type="text"
          value={inputValue}
          onChange={handlers.onInputChange}
          onKeyDown={handlers.onInputKeyDown}
          onBlur={handlers.onInputBlur}
          onFocus={handlers.onInputFocus}
          placeholder={keywords.length === 0 ? placeholder : ''}
          disabled={disabled}
          readOnly={readOnly}
          className={`
            w-full border-none outline-none bg-transparent
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            ${disabled ? 'cursor-not-allowed' : ''}
            ${inputClassName}
          `}
          aria-label={ariaLabel}
          aria-describedby={`${ariaDescribedBy ? `${ariaDescribedBy} ` : ''}${showErrors ? errorId : ''}`.trim()}
          aria-invalid={showErrors}
          aria-expanded="false"
          role="combobox"
        />

        {/* Keywords Counter */}
        <div className="absolute top-2 right-2 text-xs text-gray-400 dark:text-gray-500">
          {keywords.length}/{maxKeywords}
        </div>
      </div>

      {/* Error Messages */}
      {showErrors && (
        <div 
          id={errorId}
          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${errorClassName}`}
          role="alert"
          aria-live="polite"
        >
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {separators.includes('Enter') && 'Press Enter or '}
        {separators.filter(s => s !== 'Enter').join(', ')} to add keywords
      </div>

      {/* Debug Info (Development Only) */}
      {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
        <details className="mt-2 text-xs text-gray-400">
          <summary>Debug Info</summary>
          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
            {JSON.stringify({
              inputValue,
              keywords,
              errors,
              isValid,
              isDirty,
              isTouched,
              keywordsCount: keywords.length,
              maxKeywords
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
});

KeywordInput.displayName = 'KeywordInput';

export default KeywordInput;