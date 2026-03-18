import React, { useState, useMemo } from 'react';
import type { StructuredAchievement } from '../types';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { EditableField, Tag, InlineTagAdder } from './ValidationSharedUI';

export interface AchievementItemProps {
    achievement: StructuredAchievement;
    onUpdate: (updatedAchievement: StructuredAchievement) => void;
    onRequestAI: (type: string, payload: unknown) => Promise<unknown>;
}

export const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, onUpdate, onRequestAI }) => {
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
          const suggestion = await onRequestAI('refineAchievementField', { achievement, field }) as string;
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
