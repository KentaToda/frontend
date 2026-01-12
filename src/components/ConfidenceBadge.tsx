import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ConfidenceLevel } from '@/types/appraisal';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  showLabel?: boolean;
}

const config: Record<
  ConfidenceLevel,
  { label: string; variant: 'success' | 'warning' | 'error'; Icon: typeof CheckCircle }
> = {
  high: { label: '高', variant: 'success', Icon: CheckCircle },
  medium: { label: '中', variant: 'warning', Icon: AlertTriangle },
  low: { label: '低', variant: 'error', Icon: XCircle },
};

export function ConfidenceBadge({ level, showLabel = true }: ConfidenceBadgeProps) {
  const { label, variant, Icon } = config[level];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {showLabel && <span>信頼度: {label}</span>}
    </Badge>
  );
}
