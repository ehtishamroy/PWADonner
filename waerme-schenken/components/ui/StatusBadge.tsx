import { STATUS_COLORS, STATUS_LABELS, CONDITION_COLORS, CONDITION_LABELS } from '@/lib/constants';
import { ThumbsUp, CheckCircle, Clock, Package2, X } from 'lucide-react';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
    waiting:  <Clock      size={14} />,
    approved: <ThumbsUp   size={14} fill="white" />,
    selected: <CheckCircle size={14} fill="white" />,
    sent:     <Package2   size={14} />,
    rejected: <X          size={14} />,
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const bg    = STATUS_COLORS[status]  || '#D1D5DB';
    const label = STATUS_LABELS[status]  || status;
    const icon  = STATUS_ICONS[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold text-white ${className}`}
            style={{ backgroundColor: bg }}
        >
            {icon}
            {label}
        </span>
    );
}

interface ConditionBadgeProps {
    condition: string;
    className?: string;
}

export function ConditionBadge({ condition, className = '' }: ConditionBadgeProps) {
    const bg    = CONDITION_COLORS[condition] || '#D1D5DB';
    const label = CONDITION_LABELS[condition] || condition;

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${className}`}
            style={{ backgroundColor: bg + 'BF' }} // 75% opacity as per spec
        >
            {label}
        </span>
    );
}
