
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CareerDatabase, StructuredAchievement, KSCResponse, CareerEntry } from '../types';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { suggestTagsForItems, refineKSCResponse, refineAchievementField } from '../services/geminiService';
import { TagIcon } from './icons/TagIcon';
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
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-medium text-cyan-300">{label}</label>
          {suggestion && currentValue !== suggestion && (
            <button 
              onClick={applySuggestion}
              className="text-[10px] bg-cyan-900/40 text-cyan-300 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-cyan-800 transition-colors"
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
            className="w-full p-2 bg-gray-900 border border-cyan-500 rounded-md text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-cyan-500"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full p-2 bg-gray-900 border border-cyan-500 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
            autoFocus
          />
        )}
      </div>
    );
  }

  const hasSuggestion = suggestion && value !== suggestion;

  return (
    <div onClick={() => setEditing(true)} className="cursor-pointer group relative">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-xs font-medium text-gray-400">{label}</label>
        <div className="flex items-center gap-2">
            {isLoadingSuggestion && (
                 <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
            )}
            {!hasSuggestion && onRequestSuggestion && !isLoadingSuggestion && (
                <button 
                    onClick={triggerRequestSuggestion}
                    className="opacity-0 group-hover:opacity-100 text-[10px] bg-gray-800/80 text-gray-400 hover:text-amber-400 border border-gray-700 px-1.5 py-0.5 rounded transition-all"
                    title="Get AI Suggestion"
                >
                    <LightBulbIcon className="w-3 h-3" />
                </button>
            )}
            {hasSuggestion && (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={applySuggestion}
                        className="text-[10px] bg-amber-900/40 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-amber-800 transition-all shadow-sm"
                        title="Apply AI Suggestion"
                    >
                        <ArrowPathIcon className="w-3 h-3" /> Apply Suggestion
                    </button>
                    <LightBulbIcon className="w-4 h-4 text-amber-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
            )}
        </div>
      </div>
      <p className="text-sm p-2 bg-gray-700/50 rounded-md group-hover:bg-gray-600/50 transition-colors whitespace-pre-wrap min-h-[40px]">
        {value || 'N/A'}
      </p>
      {hasSuggestion && (
        <div className="hidden group-hover:block absolute z-20 top-full left-0 right-0 mt-2 p-3 bg-gray-800 border border-amber-500/30 rounded shadow-xl text-xs text-gray-300 animate-fade-in">
           <p className="font-bold text-amber-400 mb-1 flex items-center gap-1">
             <LightBulbIcon className="w-3 h-3" /> Suggestion:
           </p>
           <p className="italic mb-2 text-gray-300 line-clamp-3">{suggestion}</p>
           <button 
            onClick={applySuggestion}
            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
           >
             <ArrowPathIcon className="w-3 h-3" /> Apply this suggestion
           </button>
        </div>
      )}
    </div>
  );
};

// --- Tag Component ---
const Tag: React.FC<{ children: React.ReactNode; onRemove?: () => void; colorClass?: string }> = ({ children, onRemove, colorClass = "bg-cyan-900/50 text-cyan-300 border-cyan-700/30" }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${colorClass}`}>
    {children}
    {onRemove && (
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="hover:text-red-400 ml-1 transition-colors leading-none text-sm">×</button>
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
        className="text-[10px] text-cyan-400/70 hover:text-cyan-300 border border-cyan-500/20 border-dashed px-2 py-0.5 rounded-full flex items-center gap-1 transition-all hover:border-cyan-500/50"
      >
        <span className="text-sm leading-none">+</span> Add Tag
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 animate-fade-in">
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
        className="text-[10px] bg-gray-900 border border-cyan-500/50 rounded-full px-2 py-0.5 w-24 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
        placeholder="tag..."
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
        <div className={`relative p-6 rounded-lg bg-gray-800 border transition-all ${isSelected ? 'ring-2 ring-cyan-500 border-cyan-500 bg-gray-800/80' : ksc.Needs_Review_Flag ? 'border-amber-500/50' : 'border-gray-700/50'}`}>
            {isRefining && (
                <div className="absolute inset-0 z-10 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg animate-fade-in">
                    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-sm font-bold text-cyan-300">AI is analyzing your current draft...</p>
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selection Criteria Prompt</h4>
                        <div className="flex-1 border-t border-gray-700/50"></div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">Linked Experience:</label>
                                <select 
                                    value={ksc.Linked_Entry_ID || ''}
                                    onChange={(e) => handleUpdate('Linked_Entry_ID', e.target.value || undefined)}
                                    className="text-[10px] bg-gray-900 border border-gray-700 rounded px-1.5 py-0.5 text-cyan-400 focus:ring-1 focus:ring-cyan-500 focus:outline-none max-w-[150px] truncate"
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
                    <p className="text-lg font-medium text-cyan-100">{ksc.KSC_Prompt}</p>
                </div>
                <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={onToggleSelect}
                    className="ml-4 h-6 w-6 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500 bg-gray-900 cursor-pointer"
                />
            </div>

            {/* Linking Achievements UI */}
            {ksc.Linked_Entry_ID && filteredAchievementsForLink.length > 0 && (
              <div className="mb-4 p-3 bg-gray-900/40 rounded border border-cyan-900/30">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Link Specific Achievements</label>
                
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search achievements to link..."
                    value={achievementSearchTerm}
                    onChange={(e) => setAchievementSearchTerm(e.target.value)}
                    className="w-full text-xs bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-300 focus:ring-1 focus:ring-cyan-500 focus:outline-none mb-2 placeholder-gray-600"
                  />
                  <div className="max-h-32 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
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
                            className={`text-left text-[10px] px-2 py-1.5 rounded transition-all flex items-start gap-2 border ${
                              isLinked 
                              ? 'bg-cyan-900/40 border-cyan-500 text-cyan-300' 
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-300'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${isLinked ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-gray-600'}`} />
                            <span className="line-clamp-2">{ach.Action_Verb} {ach.Noun_Task} {ach.Strategy} resulting in {ach.Outcome}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 bg-amber-900/20 border border-amber-500/30 p-4 rounded-md mb-6 relative">
                <div className="flex items-center justify-between gap-2 text-amber-400 mb-1">
                    <div className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-6 h-6" />
                        <span className="font-bold">STAR Method Critique</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasAnySuggestions && (
                         <button 
                            onClick={handleBulkApplySuggestions}
                            className="text-[10px] px-3 py-1 bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 rounded hover:bg-cyan-500/30 transition-all flex items-center gap-2 font-bold"
                        >
                            <ArrowPathIcon className="w-3 h-3" /> Bulk Apply Suggestions
                        </button>
                      )}
                      <button 
                          onClick={handleRefine}
                          disabled={isRefining}
                          className="text-xs px-3 py-1.5 bg-amber-600/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-500/30 transition-all flex items-center gap-2 shadow-sm"
                      >
                          <LightBulbIcon className="w-4 h-4" /> Optimize STAR Draft
                      </button>
                    </div>
                </div>
                <p className="text-sm text-amber-200 leading-relaxed">{ksc.STAR_Feedback}</p>
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

            <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex flex-wrap gap-2 items-center">
                    {ksc.Subtype_Tags.map(tag => <Tag key={tag} onRemove={() => removeTag(tag)}>{tag}</Tag>)}
                    <InlineTagAdder onAdd={addTag} />
                    {ksc.Skills_Used.map(skill => <Tag key={skill} colorClass="bg-gray-700/50 text-gray-300 border-gray-600/30">{skill}</Tag>)}
                </div>
            </div>
            
            <div className="mt-4 flex gap-3">
                <button 
                    onClick={() => onUpdate({...ksc, Needs_Review_Flag: false})}
                    className={`text-xs px-3 py-1 rounded transition-colors ${ksc.Needs_Review_Flag ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/40' : 'bg-green-900/20 text-green-400'}`}
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
      <div className={`p-5 rounded-lg bg-gray-800/40 border transition-all ${achievement.Needs_Review_Flag ? 'border-amber-500/40 bg-amber-900/5' : 'border-gray-700/50'}`}>
          <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <p className="text-gray-400 text-sm italic leading-relaxed border-l-2 border-cyan-500/30 pl-3 flex-1 mb-2">
                  "{achievement.Original_Text}"
                </p>
                <div className="flex items-center gap-3">
                  {achievement.Needs_Review_Flag && (
                      <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold uppercase tracking-wider bg-amber-900/30 px-2 py-1 rounded border border-amber-500/30">
                          <ExclamationTriangleIcon className="w-3 h-3" />
                          <span>Missing Metric</span>
                      </div>
                  )}
                  {hasAnySuggestions && (
                    <button 
                        onClick={handleAutoApplyAllSuggestions}
                        className="text-[10px] px-2 py-1 bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 rounded hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 font-bold shadow-sm"
                    >
                        <ArrowPathIcon className="w-3 h-3" /> Auto-Apply Suggestions
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

          <div className="mt-5 pt-4 border-t border-gray-700/50">
              <div className="space-y-3">
                  {/* Managed Subtype Tags */}
                  <div>
                    <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest block mb-2">Strategy & Capability Tags</span>
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
                      <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {achievement.Skills_Used.length > 0 && (
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Extracted Skills</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {achievement.Skills_Used.map(skill => (
                                        <Tag key={skill} colorClass="bg-gray-700/30 text-gray-400 border-gray-600/20">{skill}</Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                        {achievement.Tools_Used.length > 0 && (
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Tools/Software</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {achievement.Tools_Used.map(tool => (
                                        <Tag key={tool} colorClass="bg-gray-700/30 text-gray-400 border-gray-600/20">{tool}</Tag>
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
        <div className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg border transition-all ${isSelected ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-gray-700'}`}>
            <div className="flex items-center bg-gray-700/50">
                 <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={onToggleSelect}
                    className="ml-4 h-6 w-6 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500 bg-gray-900 cursor-pointer"
                />
                <button onClick={() => setIsOpen(!isOpen)} className="flex-1 p-4 hover:bg-gray-700 transition-colors flex justify-between items-center text-left">
                    <div>
                        <h3 className="text-xl font-bold text-cyan-300">{entry.Role}</h3>
                        <p className="text-gray-300 text-sm">{entry.Organization} | {entry.StartDate} - {entry.EndDate}</p>
                    </div>
                    <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {isOpen && (
                 <div className="p-6">
                    <div className="mb-6 flex flex-wrap gap-2 items-center">
                        {entry.Subtype_Tags.map(tag => (
                            <Tag key={tag} onRemove={() => removeTag(tag)}>{tag}</Tag>
                        ))}
                        <InlineTagAdder onAdd={addTag} />
                    </div>
                    <div className="bg-gray-900/40 p-3 rounded border border-gray-700/50 mb-8">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Responsibilities Scope</span>
                        <p className="text-gray-400 text-sm italic">{entry.Core_Responsibilities_Scope}</p>
                    </div>

                    <h4 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                        <ArrowPathIcon className="w-5 h-5" /> Structured Achievements
                    </h4>
                    <div className="space-y-6">
                        {achievements.length > 0 ? (
                            achievements.map(ach => (
                                <AchievementItem key={ach.Achievement_ID} achievement={ach} onUpdate={onUpdateAchievement}/>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No achievements linked to this entry.</p>
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
  const [lastSaved, setLastSaved] = useState<string | null>(null);

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
    setSyncStatus('saving');
    try {
        await saveUserCareerData(userId, data);
        setSyncStatus('saved');
        setLastSaved(new Date().toLocaleTimeString());
        setTimeout(() => setSyncStatus('idle'), 3000);
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

  return (
    <div className="p-8 mx-auto max-w-7xl relative animate-fade-in">
        <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-bold text-cyan-300">2. Validate Processed Data</h2>
            <div className="flex items-center gap-4">
                {lastSaved && (
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                        Last Cloud Sync: {lastSaved}
                    </span>
                )}
                {userId && (
                    <button 
                        onClick={handleSyncToCloud}
                        disabled={syncStatus === 'saving'}
                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                            syncStatus === 'saving' ? 'bg-gray-700 text-gray-400 cursor-wait' : 
                            syncStatus === 'saved' ? 'bg-green-600/20 text-green-400 border border-green-500/50' :
                            'bg-cyan-600 hover:bg-cyan-500 text-white hover:scale-105 active:scale-95'
                        }`}
                    >
                        {syncStatus === 'saving' ? (
                            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : syncStatus === 'saved' ? (
                            <span>✓ Synced to Cloud</span>
                        ) : (
                            <>
                                <ArrowPathIcon className="w-4 h-4" />
                                <span>Save to Cloud Profile</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg mb-8 sticky top-[73px] z-30 shadow-lg border border-cyan-900/50 backdrop-blur-md bg-gray-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center">
                <input
                    id="needs-review"
                    type="checkbox"
                    checked={showNeedsReviewOnly}
                    onChange={(e) => setShowNeedsReviewOnly(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 bg-gray-900 cursor-pointer"
                />
                <label htmlFor="needs-review" className="ml-3 block text-md font-medium text-gray-200 cursor-pointer">
                    Show only items needing review
                </label>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                    {filteredAchievements.length} achievements | {filteredKSCs.length} STAR responses
                </div>
                {selectedIds.size > 0 && (
                     <div className="h-6 w-px bg-gray-700 mx-2" />
                )}
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <span className="text-sm font-bold text-cyan-400 whitespace-nowrap">{selectedIds.size} Selected</span>
                        <div className="flex bg-gray-900 rounded-md p-1 border border-cyan-500/30">
                            <input 
                                type="text" 
                                placeholder="Add tag..." 
                                value={bulkTagInput}
                                onChange={(e) => setBulkTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleBulkTag()}
                                className="bg-transparent border-none text-xs text-white focus:ring-0 w-24 px-2"
                            />
                            <button 
                                onClick={() => handleBulkTag()}
                                className="text-cyan-400 hover:text-cyan-300 p-1"
                                title="Apply Tag to Selected Entries & KSCs"
                            >
                                <TagIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={handleAutoTag}
                                className={`text-amber-400 hover:text-amber-300 px-2 py-1 ml-1 flex items-center gap-1 bg-amber-900/20 rounded border border-amber-500/20 hover:border-amber-500/50 transition-all ${isSuggesting ? 'animate-pulse opacity-50' : ''}`}
                                disabled={isSuggesting}
                            >
                                {isSuggesting ? (
                                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <LightBulbIcon className="w-4 h-4" />
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-wider">AI Suggest</span>
                            </button>
                        </div>
                        <button 
                            onClick={() => setSelectedIds(new Set())}
                            className="text-xs text-gray-400 hover:text-white underline whitespace-nowrap"
                        >
                            Deselect All
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Enhanced Strategic Analysis Panel */}
        {(suggestedTags.length > 0 || suggestedGaps.length > 0) && selectedIds.size > 0 && (
            <div className="mb-10 overflow-hidden bg-gray-900/40 border border-amber-500/30 rounded-xl animate-slide-down backdrop-blur-xl shadow-2xl relative">
                <div className="bg-amber-500/10 p-6 border-b border-amber-500/20">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/20 p-2 rounded-lg">
                                <LightBulbIcon className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white tracking-tight">Strategic Capability Analysis</h4>
                                <p className="text-sm text-amber-200/60">AI insights mapped to {selectedIds.size} selected history items</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {selectedSuggestedTags.size > 0 && (
                                <button 
                                    onClick={handleApplySelectedSuggestions}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg flex items-center gap-2 animate-fade-in"
                                >
                                    <TagIcon className="w-4 h-4" /> Apply {selectedSuggestedTags.size} Selected Tags
                                </button>
                            )}
                            <button 
                                onClick={() => { setSuggestedTags([]); setSuggestedGaps([]); }} 
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Tags Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                    <TagIcon className="w-4 h-4" /> Suggested Capability Tags
                                </span>
                                {suggestedTags.length > 0 && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setSelectedSuggestedTags(new Set(suggestedTags))} 
                                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-gray-600">|</span>
                                        <button 
                                            onClick={() => setSelectedSuggestedTags(new Set())} 
                                            className="text-[10px] text-gray-500 hover:text-gray-300 font-bold"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {suggestedTags.length > 0 ? (
                                    suggestedTags.map(tag => (
                                        <button 
                                            key={tag} 
                                            onClick={() => toggleSuggestedTag(tag)}
                                            className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                                                selectedSuggestedTags.has(tag) 
                                                ? 'bg-cyan-900/40 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/20' 
                                                : 'bg-gray-800/40 border-gray-700/50 text-gray-400 hover:border-amber-500/30 hover:text-amber-200'
                                            }`}
                                        >
                                            <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                                                selectedSuggestedTags.has(tag) 
                                                ? 'bg-cyan-500 border-cyan-500' 
                                                : 'border-gray-600 group-hover:border-amber-500/50'
                                            }`}>
                                                {selectedSuggestedTags.has(tag) && <span className="text-[10px] text-white font-bold leading-none">✓</span>}
                                            </div>
                                            <span className="text-sm font-medium">{tag}</span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No further tags suggested.</p>
                                )}
                            </div>
                        </div>

                        {/* Skills Gaps Section */}
                        <div className="space-y-4">
                            <span className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4" /> Strategic Skills Gaps
                            </span>
                            <div className="bg-red-900/10 border border-red-500/20 rounded-xl overflow-hidden divide-y divide-red-500/10">
                                {suggestedGaps.length > 0 ? (
                                    suggestedGaps.map((gap, i) => (
                                        <div key={i} className="p-3.5 flex items-start gap-3 hover:bg-red-500/5 transition-colors group">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500/50 flex-shrink-0 group-hover:bg-red-500 transition-colors" />
                                            <p className="text-sm text-red-200/80 leading-relaxed font-medium">{gap}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-green-400 font-bold flex items-center justify-center gap-2">
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

        <section className="mb-12">
            <h3 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <ArrowPathIcon className="w-6 h-6" /> Work Experience & Achievements
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
                    <div className="p-8 text-center bg-gray-800 rounded-lg border border-dashed border-gray-600">
                        <p className="text-gray-500 italic">No work experience entries matching your current filter.</p>
                    </div>
                )}
            </div>
        </section>

        <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                    <LightBulbIcon className="w-6 h-6" /> Key Selection Criteria (STAR Method)
                </h3>
                {filteredKSCs.length > 0 && (
                    <button
                        onClick={handleMarkAllKSCAsValidated}
                        className="text-xs px-3 py-1.5 bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 rounded hover:bg-cyan-800/60 transition-colors flex items-center gap-2"
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
                    <div className="p-8 text-center bg-gray-800 rounded-lg border border-dashed border-gray-600">
                        <p className="text-gray-500 italic">No KSC responses matching your current filter.</p>
                    </div>
                )}
            </div>
        </section>

        {/* API Preview Section */}
        <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-cyan-300">3. API Output Preview</h2>
            <p className="text-gray-400 mb-4">
                This is the structured JSON data that would be available via the secure API for the "CareerCopilot" tool to consume.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-auto border border-gray-700">
                <pre className="text-sm text-green-300">{JSON.stringify(data, null, 2)}</pre>
            </div>
        </div>
    </div>
  );
};
