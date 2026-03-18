import React, { useState } from 'react';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';

export interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (newValue: string) => void;
  isTextArea?: boolean;
  suggestion?: string;
  onRequestSuggestion?: () => Promise<void>;
  isLoadingSuggestion?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({ 
  label, 
  value, 
  onSave, 
  isTextArea = false, 
  suggestion, 
  onRequestSuggestion, 
  isLoadingSuggestion 
}) => {
  const [editing, setEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleSave = () => {
    onSave(currentValue);
    setEditing(false);
  };

  const applySuggestion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (suggestion) {
      setCurrentValue(suggestion);
      onSave(suggestion);
    }
  };

  const triggerRequestSuggestion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRequestSuggestion) {
        onRequestSuggestion();
    }
  };

  if (editing) {
    return (
      <div className="relative group/field">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-widest">{label}</label>
          {suggestion && currentValue !== suggestion && (
            <button 
              onClick={applySuggestion}
              className="text-[10px] font-bold uppercase tracking-wider bg-[var(--sys-color-kr-activistSmokeGreen-steps-0)] text-[var(--sys-color-kr-activistSmokeGreen-steps-4)] border-2 border-[var(--sys-color-kr-activistSmokeGreen-base)] px-2 py-1 flex items-center gap-2 hover:bg-[var(--sys-color-kr-activistSmokeGreen-base)] hover:text-[var(--sys-color-charcoalBackground-base)] transition-colors"
              style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
              title="Apply AI Suggestion"
            >
              <ArrowPathIcon className="w-3 h-3" /> Use AI Suggestion
            </button>
          )}
        </div>
        {isTextArea ? (
          <textarea
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
            className="w-full p-4 bg-[var(--sys-color-charcoalBackground-steps-0)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-base type-melancholyLonging min-h-[120px] focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)] text-[var(--sys-color-paperWhite-base)]"
            style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full p-3 bg-[var(--sys-color-charcoalBackground-steps-0)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-base type-melancholyLonging focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)] text-[var(--sys-color-paperWhite-base)]"
            style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
            autoFocus
          />
        )}
      </div>
    );
  }

  const hasSuggestion = suggestion && value !== suggestion;

  return (
    <div onClick={() => setEditing(true)} className="cursor-pointer group relative">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-xs font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-3">
            {isLoadingSuggestion && (
                 <div className="w-4 h-4 border-2 border-[var(--sys-color-concreteGrey-steps-0)] border-t-transparent rounded-full animate-spin" />
            )}
            {!hasSuggestion && onRequestSuggestion && !isLoadingSuggestion && (
                <button 
                    onClick={triggerRequestSuggestion}
                    className="text-[10px] font-bold uppercase tracking-wider bg-[var(--sys-color-charcoalBackground-steps-3)] text-[var(--sys-color-paperWhite-base)] hover:bg-[var(--sys-color-charcoalBackground-steps-4)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] px-3 py-1 transition-all flex items-center gap-2"
                    style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                    title="Get AI Suggestion"
                >
                    <LightBulbIcon className="w-3 h-3 text-[var(--sys-color-stencilYellow-base)]" />
                    <span>AI Suggest</span>
                </button>
            )}
            {hasSuggestion && (
                <div className="flex items-center gap-3">
                    <button 
                        onClick={applySuggestion}
                        className="text-[10px] font-bold uppercase tracking-wider bg-[var(--sys-color-kr-activistSmokeGreen-steps-0)] text-[var(--sys-color-kr-activistSmokeGreen-steps-4)] border-2 border-[var(--sys-color-kr-activistSmokeGreen-base)] px-3 py-1 flex items-center gap-2 hover:bg-[var(--sys-color-kr-activistSmokeGreen-base)] hover:text-[var(--sys-color-charcoalBackground-base)] transition-all shadow-[var(--sys-shadow-elevation1Resting)]"
                        style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                        title="Apply AI Suggestion"
                    >
                        <ArrowPathIcon className="w-3 h-3" /> Apply Suggestion
                    </button>
                    <LightBulbIcon className="w-5 h-5 text-[var(--sys-color-stencilYellow-base)] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
            )}
        </div>
      </div>
      <p className="text-base type-melancholyLonging p-4 bg-[var(--sys-color-charcoalBackground-steps-2)] group-hover:bg-[var(--sys-color-charcoalBackground-steps-3)] transition-colors whitespace-pre-wrap min-h-[60px] text-[var(--sys-color-paperWhite-base)] border-2 border-transparent group-hover:border-[var(--sys-color-concreteGrey-steps-0)]" style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
        {value || 'N/A'}
      </p>
      {hasSuggestion && (
        <div className="hidden group-hover:block absolute z-20 top-full left-0 right-0 mt-3 p-4 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-stencilYellow-base)] shadow-[var(--sys-shadow-elevation3HoverLift)] text-sm text-[var(--sys-color-paperWhite-base)] animate-fade-in" style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
           <p className="font-bold text-[var(--sys-color-stencilYellow-base)] mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
             <LightBulbIcon className="w-4 h-4" /> Suggestion:
           </p>
           <p className="type-melancholyLonging mb-4 text-[var(--sys-color-worker-ash-base)] line-clamp-3">{suggestion}</p>
           <button 
            onClick={applySuggestion}
            className="text-[var(--sys-color-kr-activistSmokeGreen-base)] hover:text-[var(--sys-color-paperWhite-base)] font-bold flex items-center gap-2 uppercase tracking-wider text-xs"
           >
             <ArrowPathIcon className="w-4 h-4" /> Apply this suggestion
           </button>
        </div>
      )}
    </div>
  );
};

export interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  colorClass?: string;
}

export const Tag: React.FC<TagProps> = ({ children, onRemove, colorClass = "bg-[var(--sys-color-charcoalBackground-steps-3)] text-[var(--sys-color-paperWhite-base)] border-[var(--sys-color-concreteGrey-steps-0)]" }) => (
  <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 border-2 ${colorClass}`} style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
    {children}
    {onRemove && (
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="hover:text-[var(--sys-color-solidarityRed-base)] ml-2 transition-colors leading-none text-base">×</button>
    )}
  </span>
);

export interface InlineTagAdderProps {
  onAdd: (tag: string) => void;
}

export const InlineTagAdder: React.FC<InlineTagAdderProps> = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [val, setVal] = useState('');

  if (!isAdding) {
    return (
      <button 
        onClick={() => setIsAdding(true)}
        className="text-xs font-bold uppercase tracking-widest text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] border-dashed px-3 py-1 flex items-center gap-2 transition-all hover:border-[var(--sys-color-paperWhite-base)]"
        style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
      >
        <span className="text-base leading-none">+</span> Add Tag
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <input 
        type="text" 
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { if (!val) setIsAdding(false); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (val.trim()) onAdd(val.trim());
            setVal('');
            setIsAdding(false);
          } else if (e.key === 'Escape') {
            setIsAdding(false);
          }
        }}
        className="text-xs font-bold uppercase tracking-widest bg-[var(--sys-color-charcoalBackground-steps-0)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] px-3 py-1 w-32 text-[var(--sys-color-paperWhite-base)] focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)]"
        style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
        placeholder="TAG..."
      />
    </div>
  );
};
