import React, { useState, useMemo } from 'react';
import type { KSCResponse, CareerEntry, StructuredAchievement } from '../types';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { EditableField, Tag, InlineTagAdder } from './ValidationSharedUI';

export interface KSCItemProps {
    ksc: KSCResponse;
    allEntries: CareerEntry[];
    allAchievements: StructuredAchievement[];
    onUpdate: (updatedKsc: KSCResponse) => void;
    isSelected: boolean;
    onToggleSelect: () => void;
    onRequestAI: (type: string, payload: unknown) => Promise<unknown>;
}

export const KSCItem: React.FC<KSCItemProps> = ({ ksc, allEntries, allAchievements, onUpdate, isSelected, onToggleSelect, onRequestAI }) => {
    const [isRefining, setIsRefining] = useState(false);
    const [achievementSearchTerm, setAchievementSearchTerm] = useState('');

    const handleUpdate = (field: keyof KSCResponse, value: unknown) => {
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
            const refined = await onRequestAI('refineKSC', ksc) as Partial<KSCResponse>;
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
