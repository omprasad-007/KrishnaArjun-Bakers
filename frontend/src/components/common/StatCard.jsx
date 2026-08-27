import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend = null, onClick = null }) => {
  const colorMap = {
    primary: 'bg-[#6c2f00]/10 text-[#6c2f00] border-[#8b4513]/20',
    amber: 'bg-[#fea619]/15 text-[#855300] border-[#fea619]/30',
    green: 'bg-[#dcfce7] text-[#166534] border-[#86efac]/50',
    red: 'bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]/50',
    blue: 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]/50',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-[#dac2b6]/40 shadow-warm-sm hover:shadow-warm-md transition-all ${
        onClick ? 'cursor-pointer hover:border-primary/40' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#54433a] uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.primary}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="font-headline text-2xl md:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            {trend && <span className="font-semibold text-secondary">{trend}</span>}
            <span>{subtitle}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
