import { X } from 'lucide-react';

import { todayWorkDate } from '../lib/work-date';
import { Button } from './ui/Button';
import { TextField } from './ui/TextField';

export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

export interface DateRangeFilterProps extends DateRange {
  onChange: (range: DateRange) => void;
}

// min/max on each input keep the range valid (from <= to, nothing in the future) without a
// separate error message.
export function DateRangeFilter({ dateFrom, dateTo, onChange }: DateRangeFilterProps) {
  const today = todayWorkDate();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <TextField
        label="From"
        type="date"
        value={dateFrom}
        max={dateTo || today}
        onChange={(event) => onChange({ dateFrom: event.target.value, dateTo })}
        className="w-40"
      />
      <TextField
        label="To"
        type="date"
        value={dateTo}
        min={dateFrom || undefined}
        max={today}
        onChange={(event) => onChange({ dateFrom, dateTo: event.target.value })}
        className="w-40"
      />
      {(dateFrom || dateTo) && (
        <Button variant="ghost" onClick={() => onChange({ dateFrom: '', dateTo: '' })}>
          <X aria-hidden />
          Clear dates
        </Button>
      )}
    </div>
  );
}
