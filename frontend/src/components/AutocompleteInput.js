import React, { useState, useRef, useEffect } from 'react';
import './AutocompleteInput.css';

const AutocompleteInput = ({ 
  value, 
  onChange, 
  onSelect, 
  suggestions, 
  placeholder, 
  className = '', 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(newValue.length > 0 && suggestions.length > 0);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    if (value.length > 0 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSelect(suggestion);
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[focusedIndex]);
        } else if (suggestions.length > 0) {
          handleSuggestionClick(suggestions[0]);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
      
      default:
        break;
    }
  };

  return (
    <div className={`autocomplete-container ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="autocomplete-input"
        autoComplete="off"
      />
      
      {isOpen && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="autocomplete-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`autocomplete-suggestion ${
                index === focusedIndex ? 'focused' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              <span className="suggestion-icon">📍</span>
              <span className="suggestion-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput; 