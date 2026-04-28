import { STATUS_COLORS, STATUS_LABELS, CONDITION_COLORS, CONDITION_LABELS } from '@/lib/constants';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const STATUS_ICON_PATHS: Record<string, string> = {
    waiting:  '/images/icon-status-waiting.png',
    approved: '/images/icon-status-approved.png',
    selected: '/images/icon-status-selected.png',
    sent:     '/images/icon-status-sent.png',
    rejected: '/images/icon-status-rejected.png',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const bg    = STATUS_COLORS[status]  || '#D1D5DB';
    const label = STATUS_LABELS[status]  || status;
    const iconPath = STATUS_ICON_PATHS[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold text-white ${className}`}
            style={{ backgroundColor: bg }}
        >
            {iconPath && <img src={iconPath} alt="" width={14} height={14} className="object-contain" />}
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
