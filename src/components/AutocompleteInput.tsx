import React, { useState, useEffect, useRef } from 'react';

interface Option {
  id: string;
  label: string;
}

interface AutocompleteInputProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Pesquisar...',
  required = false,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize initial input text if a value is selected
  useEffect(() => {
    const selectedOption = options.find(opt => opt.id === value);
    if (selectedOption) {
      setQuery(selectedOption.label);
    } else if (!value) {
      setQuery('');
    }
  }, [value, options]);

  // Filter options based on input query
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        e.preventDefault();
        const selected = filteredOptions[highlightedIndex];
        onChange(selected.id);
        setQuery(selected.label);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setQuery(option.label);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="autocomplete-field relative w-full">
      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
            // If query is cleared, clear selection
            if (e.target.value === '') {
              onChange('');
            }
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required && !value}
          disabled={disabled}
          className="w-full min-h-[2.55rem] border border-brand-line rounded-lg px-3 pr-10 text-sm bg-brand-surface text-brand-ink focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
        />

        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-ink text-lg font-bold flex items-center justify-center w-5 h-5 rounded-full hover:bg-slate-100 transition-colors"
            title="Limpar campo"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && !disabled && filteredOptions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-brand-surface border border-brand-line rounded-lg shadow-lg z-50 py-1 text-sm">
          {filteredOptions.map((opt, index) => {
            const isSelected = opt.id === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={opt.id}
                onMouseDown={() => handleSelect(opt)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-4 py-2.5 cursor-pointer flex justify-between items-center transition-colors ${
                  isHighlighted ? 'bg-brand-surface-tint text-brand-primary-strong' : ''
                } ${
                  isSelected ? 'font-bold text-brand-primary' : 'text-brand-ink'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <span className="text-brand-primary font-bold text-xs">✓</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && !disabled && query && filteredOptions.length === 0 && (
        <div className="absolute left-0 right-0 mt-1 p-4 bg-brand-surface border border-brand-line rounded-lg shadow-lg z-50 text-center text-xs text-brand-muted">
          Nenhum resultado encontrado.
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
