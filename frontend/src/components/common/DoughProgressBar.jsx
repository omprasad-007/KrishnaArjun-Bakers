import React from 'react';
import { Clock, CheckCircle2, Flame, PackageCheck, Truck, Sparkles, XCircle } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock, desc: 'Awaiting bakery confirmation' },
  { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2, desc: 'Scheduled in bake queue' },
  { key: 'PREPARING', label: 'In Oven (Baking)', icon: Flame, desc: 'Freshly baking in kitchen' },
  { key: 'READY', label: 'Fresh & Ready', icon: PackageCheck, desc: 'Packed & ready for pickup/delivery' },
  { key: 'COMPLETED', label: 'Completed', icon: Sparkles, desc: 'Order delivered / picked up' },
];

export const DoughProgressBar = ({ currentStatus }) => {
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';
  
  const statusIndexMap = {
    'PENDING': 0,
    'ACCEPTED': 1,
    'PREPARING': 2,
    'READY': 3,
    'RECEIVED': 4,
    'COMPLETED': 4,
  };

  const activeIndex = statusIndexMap[currentStatus] ?? 0;
  const progressPercent = isCancelled ? 100 : (activeIndex / (STATUS_STEPS.length - 1)) * 100;

  if (isCancelled) {
    return (
      <div className="bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#fee2e2] flex items-center justify-center text-[#dc2626]">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-headline font-bold text-[#991b1b] text-base">Order {currentStatus}</h4>
          <p className="text-xs text-[#b91c1c]">This order was {currentStatus.toLowerCase()}. Any reserved bakery inventory has been safely restored.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-[#dac2b6]/40 rounded-2xl p-5 shadow-warm-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary/70">Baking Progress</span>
          <h3 className="font-headline font-bold text-lg text-[#1b1c1c] flex items-center gap-2">
            <span>Status:</span>
            <span className="text-secondary bg-[#fea619]/15 px-3 py-0.5 rounded-full text-sm font-semibold">
              {currentStatus}
            </span>
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 font-medium">Stage {activeIndex + 1} of {STATUS_STEPS.length}</span>
        </div>
      </div>

      {/* Dough Tube Track */}
      <div className="relative my-6">
        <div className="w-full h-3 bg-[#f0eded] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#fea619] via-[#8b4513] to-[#6c2f00] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Nodes */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-1">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = step.icon;

            let circleClass = "bg-white text-gray-400 border-2 border-gray-300";
            if (isCompleted) {
              circleClass = "bg-[#8b4513] text-white border-2 border-[#8b4513] shadow-warm-sm";
            } else if (isCurrent) {
              circleClass = "bg-[#fea619] text-[#6c2f00] border-2 border-[#8b4513] ring-4 ring-[#fea619]/30 animate-pulse";
            }

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${circleClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Labels */}
      <div className="grid grid-cols-5 gap-1 pt-2 text-center">
        {STATUS_STEPS.map((step, idx) => {
          const isCurrent = idx === activeIndex;
          const isPast = idx <= activeIndex;
          return (
            <div key={step.key} className="flex flex-col items-center">
              <span className={`text-[11px] md:text-xs font-semibold ${isCurrent ? 'text-primary font-bold' : isPast ? 'text-gray-800' : 'text-gray-400'}`}>
                {step.label}
              </span>
              <span className="hidden md:block text-[10px] text-gray-500 mt-0.5 leading-tight">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoughProgressBar;
