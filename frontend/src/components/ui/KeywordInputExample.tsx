import React, { useState, useRef } from 'react';
import KeywordInput from './KeywordInput';
import type { KeywordInputMethods } from '../../types/components';

export const KeywordInputExample: React.FC = () => {
  const [basicKeywords, setBasicKeywords] = useState<string[]>(['react', 'typescript']);
  const [validatedKeywords, setValidatedKeywords] = useState<string[]>([]);
  const [submittedKeywords, setSubmittedKeywords] = useState<string[]>([]);
  
  const keywordInputRef = useRef<KeywordInputMethods>(null);

  const handleBasicChange = (keywords: string[]) => {
    setBasicKeywords(keywords);
    console.log('Basic keywords changed:', keywords);
  };

  const handleValidatedChange = (keywords: string[]) => {
    setValidatedKeywords(keywords);
    console.log('Validated keywords changed:', keywords);
  };

  const handleSubmit = (keywords: string[]) => {
    setSubmittedKeywords(keywords);
    console.log('Keywords submitted:', keywords);
    alert(`Submitted keywords: ${keywords.join(', ')}`);
  };

  const handleClear = () => {
    keywordInputRef.current?.clear();
  };

  const handleReset = () => {
    keywordInputRef.current?.reset();
  };

  const handleAddKeyword = () => {
    keywordInputRef.current?.addKeyword('programmatically-added');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        KeywordInput Component Examples
      </h1>

      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Basic Usage
        </h2>
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <KeywordInput
            value={basicKeywords}
            onChange={handleBasicChange}
            placeholder="Add your keywords here..."
            aria-label="Basic keywords input"
          />
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Current keywords: {JSON.stringify(basicKeywords)}
          </div>
        </div>
      </section>

      {/* With Validation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          With Validation
        </h2>
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <KeywordInput
            value={validatedKeywords}
            onChange={handleValidatedChange}
            placeholder="Add 2-5 keywords (min 3 chars each)..."
            maxKeywords={5}
            minKeywordLength={3}
            maxKeywordLength={20}
            allowDuplicates={false}
            validation={{
              required: true,
              minCount: 2,
              maxCount: 5,
              pattern: /^[a-zA-Z0-9-_]+$/,
              customValidator: (keyword) => {
                if (keyword.toLowerCase().includes('bad')) {
                  return 'Keyword cannot contain "bad"';
                }
                return null;
              }
            }}
            aria-label="Validated keywords input"
          />
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Current keywords: {JSON.stringify(validatedKeywords)}
          </div>
        </div>
      </section>

      {/* With Submit Handler */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          With Submit Handler
        </h2>
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <form onSubmit={(e) => {
            e.preventDefault();
            keywordInputRef.current?.validate();
          }}>
            <KeywordInput
              ref={keywordInputRef}
              value={submittedKeywords}
              onChange={setSubmittedKeywords}
              onSubmit={handleSubmit}
              placeholder="Add keywords and press submit..."
              maxKeywords={10}
              validation={{
                required: true,
                minCount: 1
              }}
              aria-label="Submittable keywords input"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Submit Keywords
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Add Keyword
              </button>
            </div>
          </form>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Last submitted: {JSON.stringify(submittedKeywords)}
          </div>
        </div>
      </section>

      {/* Custom Styling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Custom Styling
        </h2>
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <KeywordInput
            value={[]}
            onChange={() => {}}
            placeholder="Custom styled input..."
            className="custom-keyword-input"
            inputClassName="text-purple-600 dark:text-purple-400"
            keywordClassName="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200"
            errorClassName="text-purple-600 dark:text-purple-400"
            aria-label="Custom styled keywords input"
          />
        </div>
      </section>

      {/* Disabled State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Disabled State
        </h2>
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <KeywordInput
            value={['disabled', 'keyword', 'input']}
            onChange={() => {}}
            disabled={true}
            aria-label="Disabled keywords input"
          />
        </div>
      </section>

      {/* Read-Only State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Read-Only State
        </h2>
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <KeywordInput
            value={['read-only', 'keywords', 'display']}
            onChange={() => {}}
            readOnly={true}
            aria-label="Read-only keywords input"
          />
        </div>
      </section>

      {/* Custom Separators */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Custom Separators
        </h2>
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <KeywordInput
            value={[]}
            onChange={() => {}}
            placeholder="Try separating with space, comma, or pipe..."
            separators={[' ', ',', '|']}
            aria-label="Custom separators keywords input"
          />
        </div>
      </section>

      {/* API Reference */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          API Reference
        </h2>
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm">
          <h3 className="font-semibold mb-2">KeywordInput Props:</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li><code>value: string[]</code> - Current keywords array</li>
            <li><code>onChange: (keywords: string[]) =&gt; void</code> - Called when keywords change</li>
            <li><code>onSubmit?: (keywords: string[]) =&gt; void</code> - Called on form submission</li>
            <li><code>placeholder?: string</code> - Input placeholder text</li>
            <li><code>maxKeywords?: number</code> - Maximum number of keywords (default: 50)</li>
            <li><code>maxKeywordLength?: number</code> - Maximum length per keyword</li>
            <li><code>minKeywordLength?: number</code> - Minimum length per keyword</li>
            <li><code>allowDuplicates?: boolean</code> - Allow duplicate keywords</li>
            <li><code>separators?: string[]</code> - Characters that trigger keyword addition</li>
            <li><code>validation?: object</code> - Validation rules</li>
            <li><code>disabled?: boolean</code> - Disable the input</li>
            <li><code>readOnly?: boolean</code> - Make the input read-only</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">Exposed Methods (via ref):</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li><code>focus()</code> - Focus the input</li>
            <li><code>blur()</code> - Blur the input</li>
            <li><code>clear()</code> - Clear all keywords</li>
            <li><code>reset()</code> - Reset to initial state</li>
            <li><code>addKeyword(keyword: string)</code> - Add a keyword programmatically</li>
            <li><code>removeKeyword(keyword: string)</code> - Remove a keyword</li>
            <li><code>validate()</code> - Validate current keywords</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default KeywordInputExample;