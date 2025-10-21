
import React from 'react';
import { JournalEntry } from '../../types';

const JournalEntryCard: React.FC<{ entry: JournalEntry }> = ({ entry }) => {
    const formattedDate = new Date(entry.date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });

    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-700">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-semibold text-slate-100">{formattedDate}</p>
                    <p className="text-xs text-slate-400">AI Mood Analysis: {entry.analysis.overallMood} ({entry.analysis.moodScore}/10)</p>
                </div>
                {entry.facialImage && (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-600 ml-4 flex-shrink-0">
                        <img src={entry.facialImage} alt="User emotion" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
            
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-1" title="Sleep Duration">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    <span>{entry.sleepHours} hrs sleep</span>
                </div>
                <div className="flex items-center gap-1" title="Stress Level">
                     <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>Stress: {entry.stressLevel}/10</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                {entry.transcribedText && (
                  <p className="text-slate-300 italic">"{entry.transcribedText}"</p>
                )}
                <div className="bg-slate-700 p-3 rounded-md">
                    <p className="text-sm text-slate-200"><strong>Feedback:</strong> {entry.analysis.feedback}</p>
                    <p className="text-sm text-green-300 mt-2"><strong>Suggestion:</strong> {entry.analysis.activitySuggestion}</p>
                </div>
            </div>
        </div>
    );
};

export default JournalEntryCard;