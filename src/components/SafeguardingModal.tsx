import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { ShieldAlert, Check, X, HeartHandshake } from 'lucide-react';
import { SafeguardingReport } from '../types';

interface SafeguardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  learnerId: string;
  mentorId?: string;
}

export const SafeguardingModal: React.FC<SafeguardingModalProps> = ({
  isOpen,
  onClose,
  learnerId,
  mentorId,
}) => {
  const { submitSafeguardingReport, language } = useApp();
  const t = getTranslation(language);

  const [category, setCategory] = useState<SafeguardingReport['category']>('rematch_request');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    submitSafeguardingReport(category, description, learnerId, mentorId);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between bg-red-50/60">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-700" />
            <h3 className="text-base font-semibold text-slate-900">
              {language === 'ta' ? 'பாதுகாப்பு & வழிகாட்டி மாற்றக் கோரிக்கை' : 'Safeguarding & Support Request'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-700 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-1">
              {language === 'ta' ? 'உங்கள் அறிக்கை பெறப்பட்டது' : 'Your Report Has Been Received'}
            </h4>
            <p className="text-xs text-slate-700 max-w-sm mx-auto">
              {language === 'ta'
                ? 'பாதுகாப்பு பொறுப்பாளர் 24 மணி நேரத்திற்குள் உங்களை தொடர்புகொள்வார். உங்களுக்கு புதிய வழிகாட்டி உடனடியாக ஒதுக்கப்படுவார்.'
                : 'Our Safeguarding Lead will review this confidentially within 24 hours. A fresh, supportive match will be arranged without any penalty.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Reassurance Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-950 flex items-start gap-2.5">
              <HeartHandshake className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">
                  {language === 'ta' ? 'முற்றிலும் ரகசியமானது & தண்டனையற்றது' : 'Confidential & Penalty-Free Guarantee'}
                </p>
                <p className="text-slate-700 leading-relaxed">
                  {language === 'ta'
                    ? 'நீங்கள் எந்த தயக்கமும் இன்றி வழிகாட்டியை மாற்ற கோரலாம். உங்கள் பாதுகாப்பு மற்றும் கற்றல் முன்னேற்றமே எங்களின் முதன்மை நோக்கம்.'
                    : 'You can request a rematch or report boundary concerns at any time without awkwardness. Your privacy and educational wellbeing come first.'}
                </p>
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ta' ? 'காரணம் / வகை' : 'Reason / Category'}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="rematch_request">
                  {language === 'ta' ? 'வழிகாட்டி மாற்றம் தேவை (கருத்து/பாடப்பிரிவு பொருந்தாமை)' : 'Request a Rematch (Goal/track misalignment)'}
                </option>
                <option value="communication_boundary">
                  {language === 'ta' ? 'அங்கீகரிக்கப்படாத தொடர்பு (தனிப்பட்ட எண்/சமூக வலைத்தளம் கோரப்பட்டது)' : 'Boundary concern (Request for personal phone/socials)'}
                </option>
                <option value="unreliable_attendance">
                  {language === 'ta' ? 'வருகை இடைவெளி (தொடர்ந்து அமர்வுக்கு வராமை)' : 'Unreliable attendance / repeated missed sessions'}
                </option>
                <option value="inappropriate_conduct">
                  {language === 'ta' ? 'முறையற்ற நடத்தை அல்லது மரியாதை குறைவு' : 'Inappropriate conduct or disrespectful tone'}
                </option>
                <option value="other">
                  {language === 'ta' ? 'பிற கவலை' : 'Other concern'}
                </option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ta' ? 'விவரம் (சுருக்கமாக விவரிக்கவும்)' : 'Details (Briefly describe what happened)'}
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={
                  language === 'ta'
                    ? 'உங்கள் கவலை அல்லது மாற்றத்திற்கான காரணத்தை எழுதுங்கள்...'
                    : 'Share details confidentially with the Safeguarding Lead...'
                }
                rows={4}
                className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-700">
              <span>Lead: Dr. Revathi Raman</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors shadow-xs"
                >
                  {language === 'ta' ? 'ரகசியமாக சமர்ப்பி' : 'Submit Confidentially'}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
