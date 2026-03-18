import React, { useState } from 'react';
import type { CareerEntry, StructuredAchievement } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { Tag, InlineTagAdder } from './ValidationSharedUI';
import { AchievementItem } from './AchievementItem';

export interface CareerEntryCardProps {
    entry: CareerEntry;
    achievements: StructuredAchievement[];
    onUpdateAchievement: (updated: StructuredAchievement) => void;
    isSelected: boolean;
    onToggleSelect: () => void;
    onUpdateEntry: (updated: CareerEntry) => void;
    onRequestAI: (type: string, payload: unknown) => Promise<unknown>;
}

export const CareerEntryCard: React.FC<CareerEntryCardProps> = ({ entry, achievements, onUpdateAchievement, isSelected, onToggleSelect, onUpdateEntry, onRequestAI }) => {
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
                                <AchievementItem key={ach.Achievement_ID} achievement={ach} onUpdate={onUpdateAchievement} onRequestAI={onRequestAI} />
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
