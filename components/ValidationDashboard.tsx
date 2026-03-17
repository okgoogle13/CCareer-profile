
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CareerDatabase, StructuredAchievement, KSCResponse, CareerEntry } from '../types';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { suggestTagsForItems, refineKSCResponse, refineAchievementField } from '../services/geminiService';
import { TagIcon } from './icons/TagIcon';
import { useAutoSave } from '../hooks/useAutoSave';
import { saveUserCareerData } from '../services/firebase';

// --- Editable Field Component ---
interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (newValue: string) => void;
  isTextArea?: boolean;
  suggestion?: string;
  onRequestSuggestion?: () => Promise<void>;
  isLoadingSuggestion?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({ 
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

// --- Tag Component ---
const Tag: React.FC<{ children: React.ReactNode; onRemove?: () => void; colorClass?: string }> = ({ children, onRemove, colorClass = "bg-[var(--sys-color-charcoalBackground-steps-3)] text-[var(--sys-color-paperWhite-base)] border-[var(--sys-color-concreteGrey-steps-0)]" }) => (
  <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 border-2 ${colorClass}`} style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
    {children}
    {onRemove && (
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="hover:text-[var(--sys-color-solidarityRed-base)] ml-2 transition-colors leading-none text-base">×</button>
    )}
  </span>
);

// --- Inline Tag Adder Component ---
const InlineTagAdder: React.FC<{ onAdd: (tag: string) => void }> = ({ onAdd }) => {
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

// --- KSC Item Component ---
interface KSCItemProps {
    ksc: KSCResponse;
    allEntries: CareerEntry[];
    allAchievements: StructuredAchievement[];
    onUpdate: (updatedKsc: KSCResponse) => void;
    isSelected: boolean;
    onToggleSelect: () => void;
}

const KSCItem: React.FC<KSCItemProps> = ({ ksc, allEntries, allAchievements, onUpdate, isSelected, onToggleSelect }) => {
    const [isRefining, setIsRefining] = useState(false);
    const [achievementSearchTerm, setAchievementSearchTerm] = useState('');

    const handleUpdate = (field: keyof KSCResponse, value: any) => {
        onUpdate({ ...ksc, [field]: value });
    };

    const removeTag = (tag: string) => {
        handleUpdate('Subtype_Tags', ksc.Subtype_Tags.filter(t => t !== tag));
    };

    const addTag = (tag: string) => {
        if (!ksc.Subtype_Tags.includes(tag)) {
            handleUpdate('Subtype_Tags', [...ksc.Subtype_Tags, tag]);
        }
    };

    const toggleLinkedAchievement = (achievementId: string) => {
      const current = ksc.Linked_Achievement_IDs || [];
      const next = current.includes(achievementId)
        ? current.filter(id => id !== achievementId)
        : [...current, achievementId];
      handleUpdate('Linked_Achievement_IDs', next);
    };

    const handleRefine = async () => {
        setIsRefining(true);
        try {
            const refined = await refineKSCResponse(ksc);
            onUpdate({ ...ksc, ...refined });
        } catch (error) {
            console.error("Refinement failed", error);
        } finally {
            setIsRefining(false);
        }
    };

    const handleBulkApplySuggestions = () => {
      const updates: Partial<KSCResponse> = {};
      const { Situation, Task, Action, Result } = ksc.Improvement_Suggestions || {};
      
      if (Situation && Situation !== ksc.Situation) updates.Situation = Situation;
      if (Task && Task !== ksc.Task) updates.Task = Task;
      if (Action && Action !== ksc.Action) updates.Action = Action;
      if (Result && Result !== ksc.Result) updates.Result = Result;
      
      if (Object.keys(updates).length > 0) {
        onUpdate({ 
            ...ksc, 
            ...updates,
            Improvement_Suggestions: {
                Situation: undefined,
                Task: undefined,
                Action: undefined,
                Result: undefined
            }
        });
      }
    };

    const hasAnySuggestions = useMemo(() => {
      if (!ksc.Improvement_Suggestions) return false;
      const { Situation, Task, Action, Result } = ksc.Improvement_Suggestions;
      return !!(
        (Situation && Situation !== ksc.Situation) ||
        (Task && Task !== ksc.Task) ||
        (Action && Action !== ksc.Action) ||
        (Result && Result !== ksc.Result)
      );
    }, [ksc.Improvement_Suggestions, ksc.Situation, ksc.Task, ksc.Action, ksc.Result]);

    const filteredAchievementsForLink = useMemo(() => {
      if (!ksc.Linked_Entry_ID) return [];
      return allAchievements.filter(ach => ach.Entry_ID === ksc.Linked_Entry_ID);
    }, [allAchievements, ksc.Linked_Entry_ID]);

    return (
        <div className={`relative p-8 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 transition-all ${isSelected ? 'ring-4 ring-[var(--sys-color-solidarityRed-base)] border-[var(--sys-color-solidarityRed-base)] bg-[var(--sys-color-charcoalBackground-steps-2)]' : ksc.Needs_Review_Flag ? 'border-[var(--sys-color-solidarityRed-base)]' : 'border-[var(--sys-color-concreteGrey-steps-0)]'}`} style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
            {isRefining && (
                <div className="absolute inset-0 z-10 bg-[var(--sys-color-charcoalBackground-base)]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in" style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
                    <div className="w-12 h-12 border-4 border-[var(--sys-color-concreteGrey-steps-0)] border-t-[var(--sys-color-solidarityRed-base)] rounded-full animate-spin mb-4" />
                    <p className="text-lg font-bold text-[var(--sys-color-paperWhite-base)] uppercase tracking-widest">AI is analyzing your current draft...</p>
                </div>
            )}

            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        <h4 className="text-xs font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-widest">Selection Criteria Prompt</h4>
                        <div className="flex-1 border-t-2 border-[var(--sys-color-concreteGrey-steps-0)]"></div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-bold text-[var(--sys-color-worker-ash-base)] uppercase whitespace-nowrap">Linked Experience:</label>
                                <select 
                                    value={ksc.Linked_Entry_ID || ''}
                                    onChange={(e) => handleUpdate('Linked_Entry_ID', e.target.value || undefined)}
                                    className="text-xs font-bold uppercase tracking-widest bg-[var(--sys-color-charcoalBackground-steps-0)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] px-3 py-1.5 text-[var(--sys-color-paperWhite-base)] focus:border-[var(--sys-color-solidarityRed-base)] focus:outline-none max-w-[200px] truncate cursor-pointer appearance-none"
                                    style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                                >
                                    <option value="">None</option>
                                    {allEntries.map(entry => (
                                        <option key={entry.Entry_ID} value={entry.Entry_ID}>
                                            {entry.Organization} - {entry.Role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <p className="text-2xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] uppercase tracking-tight">{ksc.KSC_Prompt}</p>
                </div>
                <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={onToggleSelect}
                    className="ml-6 h-6 w-6 border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-solidarityRed-base)] focus:ring-[var(--sys-color-solidarityRed-base)] bg-[var(--sys-color-charcoalBackground-steps-0)] cursor-pointer"
                    style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                />
            </div>

            {/* Linking Achievements UI */}
            {ksc.Linked_Entry_ID && filteredAchievementsForLink.length > 0 && (
              <div className="mb-6 p-4 bg-[var(--sys-color-charcoalBackground-steps-0)] border-2 border-[var(--sys-color-concreteGrey-steps-0)]" style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
                <label className="text-xs font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-widest block mb-3">Link Specific Achievements</label>
                
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search achievements to link..."
                    value={achievementSearchTerm}
                    onChange={(e) => setAchievementSearchTerm(e.target.value)}
                    className="w-full text-sm type-melancholyLonging bg-[var(--sys-color-charcoalBackground-steps-2)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] px-3 py-2 text-[var(--sys-color-paperWhite-base)] focus:border-[var(--sys-color-solidarityRed-base)] focus:outline-none mb-3 placeholder-[var(--sys-color-worker-ash-base)]"
                    style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                  />
                  <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-2 custom-scrollbar">
                    {filteredAchievementsForLink
                      .filter(ach => {
                        const searchStr = `${ach.Action_Verb} ${ach.Noun_Task} ${ach.Strategy} ${ach.Outcome}`.toLowerCase();
                        return searchStr.includes(achievementSearchTerm.toLowerCase());
                      })
                      .map(ach => {
                        const isLinked = (ksc.Linked_Achievement_IDs || []).includes(ach.Achievement_ID);
                        return (
                          <button
                            key={ach.Achievement_ID}
                            onClick={() => toggleLinkedAchievement(ach.Achievement_ID)}
                            className={`text-left text-sm type-melancholyLonging px-3 py-2 transition-all flex items-start gap-3 border-2 ${
                              isLinked 
                              ? 'bg-[var(--sys-color-charcoalBackground-steps-3)] border-[var(--sys-color-solidarityRed-base)] text-[var(--sys-color-paperWhite-base)]' 
                              : 'bg-[var(--sys-color-charcoalBackground-steps-1)] border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-worker-ash-base)] hover:border-[var(--sys-color-paperWhite-base)] hover:text-[var(--sys-color-paperWhite-base)]'
                            }`}
                            style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                          >
                            <div className={`w-3 h-3 mt-1 shrink-0 border-2 ${isLinked ? 'bg-[var(--sys-color-solidarityRed-base)] border-[var(--sys-color-solidarityRed-base)]' : 'bg-transparent border-[var(--sys-color-concreteGrey-steps-0)]'}`} style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }} />
                            <span className="line-clamp-2">{ach.Action_Verb} {ach.Noun_Task} {ach.Strategy} resulting in {ach.Outcome}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 bg-[var(--sys-color-kr-charcoalRed-steps-0)] border-2 border-[var(--sys-color-solidarityRed-base)] p-6 mb-8 relative" style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
                <div className="flex items-center justify-between gap-3 text-[var(--sys-color-solidarityRed-base)] mb-2">
                    <div className="flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-8 h-8" />
                        <span className="text-xl type-solidarityProtest uppercase tracking-tight">STAR Method Critique</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasAnySuggestions && (
                         <button 
                            onClick={handleBulkApplySuggestions}
                            className="text-xs px-4 py-2 bg-[var(--sys-color-kr-activistSmokeGreen-steps-0)] text-[var(--sys-color-kr-activistSmokeGreen-steps-4)] border-2 border-[var(--sys-color-kr-activistSmokeGreen-base)] hover:bg-[var(--sys-color-kr-activistSmokeGreen-base)] hover:text-[var(--sys-color-charcoalBackground-base)] transition-all flex items-center gap-2 font-bold uppercase tracking-wider shadow-[var(--sys-shadow-elevation2Placard)]"
                            style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                        >
                            <ArrowPathIcon className="w-4 h-4" /> Bulk Apply Suggestions
                        </button>
                      )}
                      <button 
                          onClick={handleRefine}
                          disabled={isRefining}
                          className="text-xs px-4 py-2 bg-[var(--sys-color-charcoalBackground-steps-3)] text-[var(--sys-color-stencilYellow-base)] border-2 border-[var(--sys-color-stencilYellow-base)] hover:bg-[var(--sys-color-stencilYellow-base)] hover:text-[var(--sys-color-charcoalBackground-base)] transition-all flex items-center gap-2 font-bold uppercase tracking-wider shadow-[var(--sys-shadow-elevation2Placard)]"
                          style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                      >
                          <LightBulbIcon className="w-4 h-4" /> Optimize STAR Draft
                      </button>
                    </div>
                </div>
                <p className="type-melancholyLonging text-base text-[var(--sys-color-paperWhite-base)] leading-relaxed">{ksc.STAR_Feedback}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <EditableField 
                    label="Situation" 
                    value={ksc.Situation} 
                    isTextArea 
                    onSave={(val) => handleUpdate('Situation', val)} 
                    suggestion={ksc.Improvement_Suggestions?.Situation}
                />
                <EditableField 
                    label="Task" 
                    value={ksc.Task} 
                    isTextArea 
                    onSave={(val) => handleUpdate('Task', val)} 
                    suggestion={ksc.Improvement_Suggestions?.Task}
                />
                <EditableField 
                    label="Action" 
                    value={ksc.Action} 
                    isTextArea 
                    onSave={(val) => handleUpdate('Action', val)} 
                    suggestion={ksc.Improvement_Suggestions?.Action}
                />
                <EditableField 
                    label="Result" 
                    value={ksc.Result} 
                    isTextArea 
                    onSave={(val) => handleUpdate('Result', val)} 
                    suggestion={ksc.Improvement_Suggestions?.Result}
                />
            </div>

            <div className="mt-8 pt-8 border-t-2 border-[var(--sys-color-concreteGrey-steps-0)]">
                <div className="flex flex-wrap gap-3 items-center">
                    {ksc.Subtype_Tags.map(tag => <Tag key={tag} onRemove={() => removeTag(tag)}>{tag}</Tag>)}
                    <InlineTagAdder onAdd={addTag} />
                    {ksc.Skills_Used.map(skill => <Tag key={skill} colorClass="bg-[var(--sys-color-charcoalBackground-steps-3)] text-[var(--sys-color-paperWhite-base)] border-[var(--sys-color-concreteGrey-steps-0)]">{skill}</Tag>)}
                </div>
            </div>
            
            <div className="mt-6 flex gap-4">
                <button 
                    onClick={() => onUpdate({...ksc, Needs_Review_Flag: false})}
                    className={`text-sm font-bold uppercase tracking-wider px-4 py-2 border-2 transition-colors shadow-[var(--sys-shadow-elevation2Placard)] ${ksc.Needs_Review_Flag ? 'bg-[var(--sys-color-charcoalBackground-steps-3)] text-[var(--sys-color-stencilYellow-base)] border-[var(--sys-color-stencilYellow-base)] hover:bg-[var(--sys-color-stencilYellow-base)] hover:text-[var(--sys-color-charcoalBackground-base)]' : 'bg-[var(--sys-color-kr-activistSmokeGreen-steps-0)] text-[var(--sys-color-kr-activistSmokeGreen-steps-4)] border-[var(--sys-color-kr-activistSmokeGreen-base)]'}`}
                    style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                >
                    {ksc.Needs_Review_Flag ? 'Mark as Validated' : '✓ Validated'}
                </button>
            </div>
        </div>
    );
};

// --- Achievement Item Component ---
interface AchievementItemProps {
    achievement: StructuredAchievement;
    onUpdate: (updatedAchievement: StructuredAchievement) => void;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, onUpdate }) => {
  const [fieldSuggestions, setFieldSuggestions] = useState<Partial<Record<keyof StructuredAchievement, string>>>({});
  const [loadingFields, setLoadingFields] = useState<Partial<Record<keyof StructuredAchievement, boolean>>>({});

  const handleUpdate = <K extends keyof StructuredAchievement>(field: K, value: StructuredAchievement[K]) => {
      const updated = { ...achievement, [field]: value };
      // Auto-clear flag if user provides a non-X metric
      if (field === 'Metric' && typeof value === 'string' && value.trim() !== '' && !value.toLowerCase().includes('x')) {
          updated.Needs_Review_Flag = false;
      }
      onUpdate(updated);
  };

  const removeTag = (tag: string) => {
      handleUpdate('Subtype_Tags', achievement.Subtype_Tags.filter(t => t !== tag));
  };

  const addTag = (tag: string) => {
      if (!achievement.Subtype_Tags.includes(tag)) {
          handleUpdate('Subtype_Tags', [...achievement.Subtype_Tags, tag]);
      }
  };

  const requestSuggestion = async (field: keyof StructuredAchievement) => {
      setLoadingFields(prev => ({ ...prev, [field]: true }));
      try {
          const suggestion = await refineAchievementField(achievement, field);
          setFieldSuggestions(prev => ({ ...prev, [field]: suggestion }));
      } catch (err) {
          console.error("Failed to get suggestion for achievement field", err);
      } finally {
          setLoadingFields(prev => ({ ...prev, [field]: false }));
      }
  };

  const handleAutoApplyAllSuggestions = () => {
    const updates: Partial<StructuredAchievement> = {};
    const suggestions = achievement.Improvement_Suggestions;
    if (!suggestions) return;

    const fields: (keyof typeof suggestions)[] = ['Action_Verb', 'Noun_Task', 'Metric', 'Strategy', 'Outcome'];
    fields.forEach(field => {
        if (suggestions[field] && suggestions[field] !== (achievement as any)[field]) {
            (updates as any)[field] = suggestions[field];
        }
    });

    if (Object.keys(updates).length > 0) {
        onUpdate({ 
            ...achievement, 
            ...updates,
            Improvement_Suggestions: {
                Action_Verb: undefined,
                Noun_Task: undefined,
                Metric: undefined,
                Strategy: undefined,
                Outcome: undefined
            }
        });
    }
  };

  const hasAnySuggestions = useMemo(() => {
    if (!achievement.Improvement_Suggestions) return false;
    const { Action_Verb, Noun_Task, Metric, Strategy, Outcome } = achievement.Improvement_Suggestions;
    return !!(
        (Action_Verb && Action_Verb !== achievement.Action_Verb) ||
        (Noun_Task && Noun_Task !== achievement.Noun_Task) ||
        (Metric && Metric !== achievement.Metric) ||
        (Strategy && Strategy !== achievement.Strategy) ||
        (Outcome && Outcome !== achievement.Outcome)
    );
  }, [achievement.Improvement_Suggestions, achievement.Action_Verb, achievement.Noun_Task, achievement.Metric, achievement.Strategy, achievement.Outcome]);

  return (
      <div className={`p-6 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 transition-all ${achievement.Needs_Review_Flag ? 'border-[var(--sys-color-solidarityRed-base)] bg-[var(--sys-color-kr-charcoalRed-steps-0)]' : 'border-[var(--sys-color-concreteGrey-steps-0)]'}`} style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
          <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <p className="type-melancholyLonging text-[var(--sys-color-worker-ash-base)] text-base italic leading-relaxed border-l-4 border-[var(--sys-color-solidarityRed-base)] pl-4 flex-1 mb-4">
                  "{achievement.Original_Text}"
                </p>
                <div className="flex items-center gap-3">
                  {achievement.Needs_Review_Flag && (
                      <div className="flex items-center gap-2 text-[var(--sys-color-solidarityRed-base)] text-xs font-bold uppercase tracking-widest bg-[var(--sys-color-kr-charcoalRed-steps-1)] px-3 py-1.5 border-2 border-[var(--sys-color-solidarityRed-base)]" style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          <span>Missing Metric</span>
                      </div>
                  )}
                  {hasAnySuggestions && (
                    <button 
                        onClick={handleAutoApplyAllSuggestions}
                        className="text-xs px-3 py-1.5 bg-[var(--sys-color-kr-activistSmokeGreen-steps-0)] text-[var(--sys-color-kr-activistSmokeGreen-steps-4)] border-2 border-[var(--sys-color-kr-activistSmokeGreen-base)] hover:bg-[var(--sys-color-kr-activistSmokeGreen-base)] hover:text-[var(--sys-color-charcoalBackground-base)] transition-all flex items-center gap-2 font-bold uppercase tracking-wider shadow-[var(--sys-shadow-elevation2Placard)]"
                        style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                    >
                        <ArrowPathIcon className="w-4 h-4" /> Auto-Apply Suggestions
                    </button>
                  )}
                </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <EditableField 
                label="Action Verb" 
                value={achievement.Action_Verb} 
                onSave={(val) => handleUpdate('Action_Verb', val)} 
                suggestion={achievement.Improvement_Suggestions?.Action_Verb || fieldSuggestions.Action_Verb}
                onRequestSuggestion={() => requestSuggestion('Action_Verb')}
                isLoadingSuggestion={loadingFields.Action_Verb}
              />
              <EditableField 
                label="Noun/Task" 
                value={achievement.Noun_Task} 
                onSave={(val) => handleUpdate('Noun_Task', val)} 
                suggestion={achievement.Improvement_Suggestions?.Noun_Task || fieldSuggestions.Noun_Task}
                onRequestSuggestion={() => requestSuggestion('Noun_Task')}
                isLoadingSuggestion={loadingFields.Noun_Task}
              />
              <EditableField 
                label="Metric (Quantified)" 
                value={achievement.Metric} 
                onSave={(val) => handleUpdate('Metric', val)} 
                suggestion={achievement.Improvement_Suggestions?.Metric || fieldSuggestions.Metric}
                onRequestSuggestion={() => requestSuggestion('Metric')}
                isLoadingSuggestion={loadingFields.Metric}
              />
              <EditableField 
                label="Strategy" 
                value={achievement.Strategy} 
                onSave={(val) => handleUpdate('Strategy', val)} 
                suggestion={achievement.Improvement_Suggestions?.Strategy || fieldSuggestions.Strategy}
                onRequestSuggestion={() => requestSuggestion('Strategy')}
                isLoadingSuggestion={loadingFields.Strategy}
              />
              <EditableField 
                label="Outcome" 
                value={achievement.Outcome} 
                onSave={(val) => handleUpdate('Outcome', val)} 
                suggestion={achievement.Improvement_Suggestions?.Outcome || fieldSuggestions.Outcome}
                onRequestSuggestion={() => requestSuggestion('Outcome')}
                isLoadingSuggestion={loadingFields.Outcome}
              />
          </div>

          <div className="mt-6 pt-6 border-t-2 border-[var(--sys-color-concreteGrey-steps-0)]">
              <div className="space-y-4">
                  {/* Managed Subtype Tags */}
                  <div>
                    <span className="text-xs font-bold text-[var(--sys-color-stencilYellow-base)] uppercase tracking-widest block mb-3">Strategy & Capability Tags</span>
                    <div className="flex flex-wrap gap-2 items-center">
                        {achievement.Subtype_Tags.map(tag => (
                            <Tag key={tag} onRemove={() => removeTag(tag)}>
                                {tag}
                            </Tag>
                        ))}
                        <InlineTagAdder onAdd={addTag} />
                    </div>
                  </div>

                  {/* Read-only Extracted Skills & Tools */}
                  {(achievement.Skills_Used.length > 0 || achievement.Tools_Used.length > 0) && (
                      <div className="flex flex-wrap gap-x-8 gap-y-4">
                        {achievement.Skills_Used.length > 0 && (
                            <div>
                                <span className="text-xs font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-widest block mb-2">Extracted Skills</span>
                                <div className="flex flex-wrap gap-2">
                                    {achievement.Skills_Used.map(skill => (
                                        <Tag key={skill} colorClass="bg-[var(--sys-color-charcoalBackground-steps-3)] text-[var(--sys-color-paperWhite-base)] border-[var(--sys-color-concreteGrey-steps-0)]">{skill}</Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                        {achievement.Tools_Used.length > 0 && (
                            <div>
                                <span className="text-xs font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-widest block mb-2">Tools/Software</span>
                                <div className="flex flex-wrap gap-2">
                                    {achievement.Tools_Used.map(tool => (
                                        <Tag key={tool} colorClass="bg-[var(--sys-color-charcoalBackground-steps-3)] text-[var(--sys-color-paperWhite-base)] border-[var(--sys-color-concreteGrey-steps-0)]">{tool}</Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                      </div>
                  )}
              </div>
          </div>
      </div>
  );
};

// --- Career Entry Card ---
interface CareerEntryCardProps {
    entry: CareerEntry;
    achievements: StructuredAchievement[];
    onUpdateAchievement: (updated: StructuredAchievement) => void;
    isSelected: boolean;
    onToggleSelect: () => void;
    onUpdateEntry: (updated: CareerEntry) => void;
}
const CareerEntryCard: React.FC<CareerEntryCardProps> = ({ entry, achievements, onUpdateAchievement, isSelected, onToggleSelect, onUpdateEntry }) => {
    const [isOpen, setIsOpen] = useState(true);
    
    const removeTag = (tag: string) => {
        onUpdateEntry({ ...entry, Subtype_Tags: entry.Subtype_Tags.filter(t => t !== tag) });
    };

    const addTag = (tag: string) => {
        if (!entry.Subtype_Tags.includes(tag)) {
            onUpdateEntry({ ...entry, Subtype_Tags: [...entry.Subtype_Tags, tag] });
        }
    };

    return (
        <div className={`bg-[var(--sys-color-charcoalBackground-steps-0)] overflow-hidden shadow-[var(--sys-shadow-elevation2Placard)] border-2 transition-all ${isSelected ? 'ring-4 ring-[var(--sys-color-solidarityRed-base)] border-[var(--sys-color-solidarityRed-base)]' : 'border-[var(--sys-color-concreteGrey-steps-0)]'}`} style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
            <div className="flex items-center bg-[var(--sys-color-charcoalBackground-steps-2)] border-b-2 border-[var(--sys-color-concreteGrey-steps-0)]">
                 <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={onToggleSelect}
                    className="ml-6 h-6 w-6 border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-solidarityRed-base)] focus:ring-[var(--sys-color-solidarityRed-base)] bg-[var(--sys-color-charcoalBackground-steps-0)] cursor-pointer"
                    style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                />
                <button onClick={() => setIsOpen(!isOpen)} className="flex-1 p-6 hover:bg-[var(--sys-color-charcoalBackground-steps-3)] transition-colors flex justify-between items-center text-left">
                    <div>
                        <h3 className="text-2xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] uppercase tracking-tight">{entry.Role}</h3>
                        <p className="text-[var(--sys-color-worker-ash-base)] text-sm font-bold uppercase tracking-widest mt-1">{entry.Organization} <span className="text-[var(--sys-color-solidarityRed-base)]">|</span> {entry.StartDate} - {entry.EndDate}</p>
                    </div>
                    <ChevronDownIcon className={`w-8 h-8 text-[var(--sys-color-worker-ash-base)] transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {isOpen && (
                 <div className="p-8">
                    <div className="mb-8 flex flex-wrap gap-3 items-center">
                        {entry.Subtype_Tags.map(tag => (
                            <Tag key={tag} onRemove={() => removeTag(tag)}>{tag}</Tag>
                        ))}
                        <InlineTagAdder onAdd={addTag} />
                    </div>
                    <div className="bg-[var(--sys-color-charcoalBackground-steps-1)] p-4 border-2 border-[var(--sys-color-concreteGrey-steps-0)] mb-10" style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
                        <span className="text-xs font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-widest block mb-2">Responsibilities Scope</span>
                        <p className="type-melancholyLonging text-[var(--sys-color-paperWhite-base)] text-base">{entry.Core_Responsibilities_Scope}</p>
                    </div>

                    <h4 className="text-xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] mb-6 flex items-center gap-3 uppercase tracking-tight">
                        <ArrowPathIcon className="w-6 h-6 text-[var(--sys-color-solidarityRed-base)]" /> Structured Achievements
                    </h4>
                    <div className="space-y-8">
                        {achievements.length > 0 ? (
                            achievements.map(ach => (
                                <AchievementItem key={ach.Achievement_ID} achievement={ach} onUpdate={onUpdateAchievement}/>
                            ))
                        ) : (
                            <p className="text-[var(--sys-color-worker-ash-base)] text-base italic">No achievements linked to this entry.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main Dashboard Component ---
interface ValidationDashboardProps {
  data: CareerDatabase;
  onUpdate: (newData: CareerDatabase) => void;
  userId?: string;
}

export const ValidationDashboard: React.FC<ValidationDashboardProps> = ({ data, onUpdate, userId }) => {
  const { isSaving, lastSaved, save } = useAutoSave(userId, data, (data) => saveUserCareerData(userId!, data));
  const [showNeedsReviewOnly, setShowNeedsReviewOnly] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkTagInput, setBulkTagInput] = useState('');
  
  // AI Suggestions state
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedSuggestedTags, setSelectedSuggestedTags] = useState<Set<string>>(new Set());
  const [suggestedGaps, setSuggestedGaps] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleAchievementUpdate = useCallback((updatedAchievement: StructuredAchievement) => {
      const newAchievements = data.Structured_Achievements.map(ach => 
          ach.Achievement_ID === updatedAchievement.Achievement_ID ? updatedAchievement : ach
      );
      onUpdate({ ...data, Structured_Achievements: newAchievements });
  }, [data, onUpdate]);

  const handleKSCUpdate = useCallback((updatedKsc: KSCResponse) => {
      const newKSCs = data.KSC_Responses.map(k => 
          k.KSC_ID === updatedKsc.KSC_ID ? updatedKsc : k
      );
      onUpdate({ ...data, KSC_Responses: newKSCs });
  }, [data, onUpdate]);

  const handleEntryUpdate = useCallback((updatedEntry: CareerEntry) => {
      const newEntries = data.Career_Entries.map(e => 
          e.Entry_ID === updatedEntry.Entry_ID ? updatedEntry : e
      );
      onUpdate({ ...data, Career_Entries: newEntries });
  }, [data, onUpdate]);

  const toggleSelect = (id: string) => {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectedIds(next);
  };

  const handleBulkTag = (tag?: string) => {
      const tagToAdd = (tag || bulkTagInput).trim();
      if (!tagToAdd) return;

      const newEntries = data.Career_Entries.map(e => {
          if (selectedIds.has(e.Entry_ID) && !e.Subtype_Tags.includes(tagToAdd)) {
              return { ...e, Subtype_Tags: [...e.Subtype_Tags, tagToAdd] };
          }
          return e;
      });

      const newKSCs = data.KSC_Responses.map(k => {
          if (selectedIds.has(k.KSC_ID) && !k.Subtype_Tags.includes(tagToAdd)) {
              return { ...k, Subtype_Tags: [...k.Subtype_Tags, tagToAdd] };
          }
          return k;
      });

      const newAchievements = data.Structured_Achievements.map(a => {
          if (selectedIds.has(a.Entry_ID) && !a.Subtype_Tags.includes(tagToAdd)) {
              return { ...a, Subtype_Tags: [...a.Subtype_Tags, tagToAdd] };
          }
          return a;
      });

      onUpdate({ 
        ...data, 
        Career_Entries: newEntries, 
        KSC_Responses: newKSCs, 
        Structured_Achievements: newAchievements 
      });
      setBulkTagInput('');
  };

  const handleSyncToCloud = async () => {
    if (!userId) return;
    try {
        await save(data);
        setSyncStatus('saved');
    } catch (err) {
        console.error("Sync failed", err);
        setSyncStatus('error');
    }
  };

  const handleApplySelectedSuggestions = () => {
    selectedSuggestedTags.forEach(tag => handleBulkTag(tag));
    setSuggestedTags(prev => prev.filter(t => !selectedSuggestedTags.has(t)));
    setSelectedSuggestedTags(new Set());
  };

  const toggleSuggestedTag = (tag: string) => {
      const next = new Set(selectedSuggestedTags);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      setSelectedSuggestedTags(next);
  };

  const handleAutoTag = async () => {
      setIsSuggesting(true);
      const selectedItems = [
          ...data.Career_Entries.filter(e => selectedIds.has(e.Entry_ID)),
          ...data.KSC_Responses.filter(k => selectedIds.has(k.KSC_ID))
      ];
      
      const careerContext = {
          targetTitles: data.Career_Profile.Target_Titles,
          summaryPoints: data.Career_Profile.Master_Summary_Points
      };

      try {
          const result = await suggestTagsForItems(selectedItems, careerContext);
          setSuggestedTags(result.tags);
          setSelectedSuggestedTags(new Set(result.tags)); // Select all by default
          setSuggestedGaps(result.skillsGaps);
      } catch (err) {
          console.error("AI tagging failed", err);
      } finally {
          setIsSuggesting(false);
      }
  };

  const filteredAchievements = useMemo(() => {
    return showNeedsReviewOnly 
        ? data.Structured_Achievements.filter(a => a.Needs_Review_Flag)
        : data.Structured_Achievements;
  }, [data.Structured_Achievements, showNeedsReviewOnly]);

  const filteredKSCs = useMemo(() => {
    return showNeedsReviewOnly
        ? data.KSC_Responses.filter(k => k.Needs_Review_Flag)
        : data.KSC_Responses;
  }, [data.KSC_Responses, showNeedsReviewOnly]);

  const handleMarkAllKSCAsValidated = () => {
    const filteredIds = new Set(filteredKSCs.map(k => k.KSC_ID));
    const newKSCs = data.KSC_Responses.map(k => 
      filteredIds.has(k.KSC_ID) ? { ...k, Needs_Review_Flag: false } : k
    );
    onUpdate({ ...data, KSC_Responses: newKSCs });
  };
  
  const entriesWithFilteredAchievements = useMemo(() => {
    const achievementMap = new Map<string, StructuredAchievement[]>();
    filteredAchievements.forEach(ach => {
        const entryAchievements = achievementMap.get(ach.Entry_ID) || [];
        entryAchievements.push(ach);
        achievementMap.set(ach.Entry_ID, entryAchievements);
    });

    if (showNeedsReviewOnly) {
        return data.Career_Entries
            .filter(entry => achievementMap.has(entry.Entry_ID))
            .map(entry => ({
                entry,
                achievements: achievementMap.get(entry.Entry_ID) || []
            }));
    }

    return data.Career_Entries.map(entry => ({
        entry,
        achievements: data.Structured_Achievements.filter(a => a.Entry_ID === entry.Entry_ID)
    }));
  }, [data.Career_Entries, data.Structured_Achievements, filteredAchievements, showNeedsReviewOnly]);

  const completenessScore = useMemo(() => {
    let score = 0;
    let totalWeight = 0;

    // 1. Personal Info (10%)
    totalWeight += 10;
    const pi = data.Personal_Information;
    if (pi.FullName && pi.Email && pi.Phone) score += 10;

    // 2. Career Profile (10%)
    totalWeight += 10;
    if (data.Career_Profile.Target_Titles.length > 0 && data.Career_Profile.Master_Summary_Points.length > 0) score += 10;

    // 3. Entries (30%)
    totalWeight += 30;
    if (data.Career_Entries.length > 0) score += 30;

    // 4. Achievements (30%)
    totalWeight += 30;
    const achievementsWithMetrics = data.Structured_Achievements.filter(a => a.Metric && !a.Metric.toLowerCase().includes('x'));
    if (data.Structured_Achievements.length > 0) {
        score += 15; // Have some achievements
        if (achievementsWithMetrics.length / data.Structured_Achievements.length > 0.5) {
            score += 15; // More than half have metrics
        }
    }

    // 5. KSCs (20%)
    totalWeight += 20;
    if (data.KSC_Responses.length > 0) score += 20;

    return Math.round((score / totalWeight) * 100);
  }, [data]);

  return (
    <div className="p-8 mx-auto max-w-7xl relative animate-fade-in">
        <div className="flex justify-between items-end mb-8">
            <h2 className="text-5xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] uppercase tracking-tighter">2. Validate <span className="text-[var(--sys-color-solidarityRed-base)]">Processed Data</span></h2>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[var(--sys-color-charcoalBackground-steps-2)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] px-4 py-2" style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
                    <span className="text-xs font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-widest">Profile Completeness</span>
                    <div className="w-24 h-3 bg-[var(--sys-color-charcoalBackground-steps-4)] overflow-hidden" style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
                        <div 
                            className={`h-full transition-all duration-500 ${completenessScore > 80 ? 'bg-[var(--sys-color-kr-activistSmokeGreen-base)]' : completenessScore > 50 ? 'bg-[var(--sys-color-stencilYellow-base)]' : 'bg-[var(--sys-color-kr-charcoalRed-base)]'}`}
                            style={{ width: `${completenessScore}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold text-[var(--sys-color-paperWhite-base)]">{completenessScore}%</span>
                </div>
                {lastSaved && (
                    <span className="text-[10px] text-[var(--sys-color-worker-ash-base)] uppercase font-bold tracking-tighter">
                        Last Cloud Sync: {lastSaved}
                    </span>
                )}
                {userId && (
                    <button 
                        onClick={handleSyncToCloud}
                        disabled={syncStatus === 'saving'}
                        className={`px-6 py-3 font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all shadow-[var(--sys-shadow-elevation2Placard)] hover:shadow-[var(--sys-shadow-elevation3HoverLift)] hover:-translate-y-1 ${
                            syncStatus === 'saving' ? 'bg-[var(--sys-color-charcoalBackground-steps-3)] text-[var(--sys-color-concreteGrey-steps-0)] cursor-wait' : 
                            syncStatus === 'saved' ? 'bg-[var(--sys-color-kr-activistSmokeGreen-steps-0)] text-[var(--sys-color-kr-activistSmokeGreen-steps-4)] border-2 border-[var(--sys-color-kr-activistSmokeGreen-base)]' :
                            'bg-[var(--sys-color-solidarityRed-base)] text-[var(--sys-color-paperWhite-base)]'
                        }`}
                        style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                    >
                        {syncStatus === 'saving' ? (
                            <div className="w-4 h-4 border-2 border-[var(--sys-color-concreteGrey-steps-0)] border-t-transparent rounded-full animate-spin" />
                        ) : syncStatus === 'saved' ? (
                            <span>✓ Synced to Cloud</span>
                        ) : (
                            <>
                                <ArrowPathIcon className="w-5 h-5" />
                                <span>Save to Cloud Profile</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
        
        <div className="bg-[var(--sys-color-charcoalBackground-steps-1)] p-6 mb-10 sticky top-[73px] z-30 shadow-[var(--sys-shadow-elevation2Placard)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] flex items-center justify-between gap-4" style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
            <div className="flex items-center">
                <input
                    id="needs-review"
                    type="checkbox"
                    checked={showNeedsReviewOnly}
                    onChange={(e) => setShowNeedsReviewOnly(e.target.checked)}
                    className="h-6 w-6 border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-solidarityRed-base)] focus:ring-[var(--sys-color-solidarityRed-base)] bg-[var(--sys-color-charcoalBackground-steps-0)] cursor-pointer"
                    style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                />
                <label htmlFor="needs-review" className="ml-4 block text-sm font-bold uppercase tracking-widest text-[var(--sys-color-paperWhite-base)] cursor-pointer">
                    Show only items needing review
                </label>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="text-sm font-bold uppercase tracking-widest text-[var(--sys-color-worker-ash-base)]">
                    {filteredAchievements.length} achievements | {filteredKSCs.length} STAR responses
                </div>
                {selectedIds.size > 0 && (
                     <div className="h-8 w-0.5 bg-[var(--sys-color-concreteGrey-steps-0)] mx-2" />
                )}
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-4 animate-fade-in">
                        <span className="text-sm font-bold text-[var(--sys-color-stencilYellow-base)] uppercase tracking-widest whitespace-nowrap">{selectedIds.size} Selected</span>
                        <div className="flex bg-[var(--sys-color-charcoalBackground-steps-0)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] p-1" style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
                            <input 
                                type="text" 
                                placeholder="ADD TAG..." 
                                value={bulkTagInput}
                                onChange={(e) => setBulkTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleBulkTag()}
                                className="bg-transparent border-none text-xs font-bold uppercase tracking-widest text-[var(--sys-color-paperWhite-base)] focus:ring-0 w-32 px-3 placeholder-[var(--sys-color-worker-ash-base)]"
                            />
                            <button 
                                onClick={() => handleBulkTag()}
                                className="text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)] p-2 transition-colors"
                                title="Apply Tag to Selected Entries & KSCs"
                            >
                                <TagIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={handleAutoTag}
                                className={`text-[var(--sys-color-stencilYellow-base)] hover:text-[var(--sys-color-charcoalBackground-base)] hover:bg-[var(--sys-color-stencilYellow-base)] px-3 py-1.5 ml-2 flex items-center gap-2 border-2 border-[var(--sys-color-stencilYellow-base)] transition-all ${isSuggesting ? 'animate-pulse opacity-50' : ''}`}
                                style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                                disabled={isSuggesting}
                            >
                                {isSuggesting ? (
                                    <div className="w-4 h-4 border-2 border-[var(--sys-color-stencilYellow-base)] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <LightBulbIcon className="w-4 h-4" />
                                )}
                                <span className="text-xs font-bold uppercase tracking-wider">AI Suggest</span>
                            </button>
                        </div>
                        <button 
                            onClick={() => setSelectedIds(new Set())}
                            className="text-xs font-bold uppercase tracking-widest text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-solidarityRed-base)] underline whitespace-nowrap transition-colors"
                        >
                            Deselect All
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Enhanced Strategic Analysis Panel */}
        {(suggestedTags.length > 0 || suggestedGaps.length > 0) && selectedIds.size > 0 && (
            <div className="mb-12 overflow-hidden bg-[var(--sys-color-charcoalBackground-steps-0)] border-2 border-[var(--sys-color-stencilYellow-base)] animate-slide-down shadow-[var(--sys-shadow-elevation3HoverLift)] relative" style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
                <div className="bg-[var(--sys-color-stencilYellow-base)]/10 p-8 border-b-2 border-[var(--sys-color-stencilYellow-base)]">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-[var(--sys-color-stencilYellow-base)]/20 p-3" style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
                                <LightBulbIcon className="w-8 h-8 text-[var(--sys-color-stencilYellow-base)]" />
                            </div>
                            <div>
                                <h4 className="text-3xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] uppercase tracking-tight">Strategic Capability Analysis</h4>
                                <p className="text-base text-[var(--sys-color-worker-ash-base)] font-bold uppercase tracking-widest mt-1">AI insights mapped to {selectedIds.size} selected history items</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            {selectedSuggestedTags.size > 0 && (
                                <button 
                                    onClick={handleApplySelectedSuggestions}
                                    className="px-6 py-3 bg-[var(--sys-color-kr-activistSmokeGreen-steps-0)] text-[var(--sys-color-kr-activistSmokeGreen-steps-4)] border-2 border-[var(--sys-color-kr-activistSmokeGreen-base)] hover:bg-[var(--sys-color-kr-activistSmokeGreen-base)] hover:text-[var(--sys-color-charcoalBackground-base)] text-sm font-bold uppercase tracking-wider transition-all shadow-[var(--sys-shadow-elevation2Placard)] flex items-center gap-2 animate-fade-in"
                                    style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                                >
                                    <TagIcon className="w-5 h-5" /> Apply {selectedSuggestedTags.size} Selected Tags
                                </button>
                            )}
                            <button 
                                onClick={() => { setSuggestedTags([]); setSuggestedGaps([]); }} 
                                className="w-10 h-10 flex items-center justify-center border-2 border-[var(--sys-color-concreteGrey-steps-0)] hover:border-[var(--sys-color-solidarityRed-base)] hover:text-[var(--sys-color-solidarityRed-base)] text-[var(--sys-color-worker-ash-base)] transition-colors"
                                style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                            >
                                <span className="text-2xl leading-none">×</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Tags Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-[var(--sys-color-stencilYellow-base)] uppercase tracking-widest flex items-center gap-3">
                                    <TagIcon className="w-5 h-5" /> Suggested Capability Tags
                                </span>
                                {suggestedTags.length > 0 && (
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setSelectedSuggestedTags(new Set(suggestedTags))} 
                                            className="text-xs text-[var(--sys-color-kr-activistSmokeGreen-base)] hover:text-[var(--sys-color-paperWhite-base)] font-bold uppercase tracking-wider"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-[var(--sys-color-concreteGrey-steps-0)]">|</span>
                                        <button 
                                            onClick={() => setSelectedSuggestedTags(new Set())} 
                                            className="text-xs text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)] font-bold uppercase tracking-wider"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {suggestedTags.length > 0 ? (
                                    suggestedTags.map(tag => (
                                        <button 
                                            key={tag} 
                                            onClick={() => toggleSuggestedTag(tag)}
                                            className={`group relative inline-flex items-center gap-3 px-4 py-2 border-2 transition-all ${
                                                selectedSuggestedTags.has(tag) 
                                                ? 'bg-[var(--sys-color-charcoalBackground-steps-3)] border-[var(--sys-color-stencilYellow-base)] text-[var(--sys-color-paperWhite-base)]' 
                                                : 'bg-[var(--sys-color-charcoalBackground-steps-1)] border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-worker-ash-base)] hover:border-[var(--sys-color-stencilYellow-base)] hover:text-[var(--sys-color-paperWhite-base)]'
                                            }`}
                                            style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                                        >
                                            <div className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${
                                                selectedSuggestedTags.has(tag) 
                                                ? 'bg-[var(--sys-color-stencilYellow-base)] border-[var(--sys-color-stencilYellow-base)]' 
                                                : 'border-[var(--sys-color-concreteGrey-steps-0)] group-hover:border-[var(--sys-color-stencilYellow-base)]'
                                            }`} style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
                                                {selectedSuggestedTags.has(tag) && <span className="text-xs text-[var(--sys-color-charcoalBackground-base)] font-bold leading-none">✓</span>}
                                            </div>
                                            <span className="text-sm font-bold uppercase tracking-widest">{tag}</span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-base type-melancholyLonging text-[var(--sys-color-worker-ash-base)] italic">No further tags suggested.</p>
                                )}
                            </div>
                        </div>

                        {/* Skills Gaps Section */}
                        <div className="space-y-6">
                            <span className="text-sm font-bold text-[var(--sys-color-solidarityRed-base)] uppercase tracking-widest flex items-center gap-3">
                                <ExclamationTriangleIcon className="w-5 h-5" /> Strategic Skills Gaps
                            </span>
                            <div className="bg-[var(--sys-color-kr-charcoalRed-steps-0)] border-2 border-[var(--sys-color-solidarityRed-base)] overflow-hidden divide-y-2 divide-[var(--sys-color-solidarityRed-base)]" style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}>
                                {suggestedGaps.length > 0 ? (
                                    suggestedGaps.map((gap, i) => (
                                        <div key={i} className="p-4 flex items-start gap-4 hover:bg-[var(--sys-color-kr-charcoalRed-steps-1)] transition-colors group">
                                            <div className="mt-1.5 w-2 h-2 bg-[var(--sys-color-solidarityRed-base)] flex-shrink-0" style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }} />
                                            <p className="text-base type-melancholyLonging text-[var(--sys-color-paperWhite-base)] leading-relaxed">{gap}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-base font-bold text-[var(--sys-color-kr-activistSmokeGreen-base)] uppercase tracking-widest flex items-center justify-center gap-3">
                                            ✓ No major capability gaps identified!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <section className="mb-16">
            <h3 className="text-3xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] mb-8 uppercase tracking-tight flex items-center gap-3">
                <ArrowPathIcon className="w-8 h-8 text-[var(--sys-color-solidarityRed-base)]" /> Work Experience & Achievements
            </h3>
            <div className="space-y-8">
                {entriesWithFilteredAchievements.length > 0 ? (
                    entriesWithFilteredAchievements.map(({ entry, achievements }) => (
                        <CareerEntryCard 
                            key={entry.Entry_ID} 
                            entry={entry} 
                            achievements={achievements}
                            onUpdateAchievement={handleAchievementUpdate}
                            isSelected={selectedIds.has(entry.Entry_ID)}
                            onToggleSelect={() => toggleSelect(entry.Entry_ID)}
                            onUpdateEntry={handleEntryUpdate}
                        />
                    ))
                ) : (
                    <div className="p-12 text-center bg-[var(--sys-color-charcoalBackground-steps-0)] border-2 border-dashed border-[var(--sys-color-concreteGrey-steps-0)]" style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
                        <p className="text-lg type-melancholyLonging text-[var(--sys-color-worker-ash-base)] italic">No work experience entries matching your current filter.</p>
                    </div>
                )}
            </div>
        </section>

        <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] uppercase tracking-tight flex items-center gap-3">
                    <LightBulbIcon className="w-8 h-8 text-[var(--sys-color-stencilYellow-base)]" /> Key Selection Criteria (STAR Method)
                </h3>
                {filteredKSCs.length > 0 && (
                    <button
                        onClick={handleMarkAllKSCAsValidated}
                        className="text-xs px-4 py-2 bg-[var(--sys-color-charcoalBackground-steps-3)] text-[var(--sys-color-paperWhite-base)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] hover:border-[var(--sys-color-paperWhite-base)] font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                        style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
                    >
                        Mark All Shown as Validated
                    </button>
                )}
            </div>
            <div className="space-y-8">
                {filteredKSCs.length > 0 ? (
                    filteredKSCs.map(ksc => (
                        <KSCItem 
                            key={ksc.KSC_ID} 
                            ksc={ksc} 
                            allEntries={data.Career_Entries}
                            allAchievements={data.Structured_Achievements}
                            onUpdate={handleKSCUpdate}
                            isSelected={selectedIds.has(ksc.KSC_ID)}
                            onToggleSelect={() => toggleSelect(ksc.KSC_ID)}
                        />
                    ))
                ) : (
                    <div className="p-12 text-center bg-[var(--sys-color-charcoalBackground-steps-0)] border-2 border-dashed border-[var(--sys-color-concreteGrey-steps-0)]" style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
                        <p className="text-lg type-melancholyLonging text-[var(--sys-color-worker-ash-base)] italic">No KSC responses matching your current filter.</p>
                    </div>
                )}
            </div>
        </section>

        {/* API Preview Section */}
        <div className="mt-16 pt-16 border-t-2 border-[var(--sys-color-concreteGrey-steps-0)]">
            <h2 className="text-4xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] mb-6 uppercase tracking-tighter">3. API Output <span className="text-[var(--sys-color-solidarityRed-base)]">Preview</span></h2>
            <p className="type-melancholyLonging text-[var(--sys-color-worker-ash-base)] text-lg mb-8">
                This is the structured JSON data that would be available via the secure API for the "CareerCopilot" tool to consume.
            </p>
            <div className="bg-[var(--sys-color-charcoalBackground-steps-0)] p-6 h-96 overflow-auto border-2 border-[var(--sys-color-concreteGrey-steps-0)]" style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
                <pre className="text-sm text-[var(--sys-color-kr-activistSmokeGreen-base)] font-mono">{JSON.stringify(data, null, 2)}</pre>
            </div>
        </div>
    </div>
  );
};
