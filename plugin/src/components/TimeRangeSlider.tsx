import { useEffect, useState } from 'react';
import { RangeSlider } from '@mantine/core';

interface TimeRangeSliderProps {
  min: number;
  max: number;
  value: number[];
  onValueChange: (value: number[]) => void;
  step?: number;
}

export function TimeRangeSlider({
  min,
  max,
  step = 1,
  value,
  onValueChange,
}: TimeRangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>([value[0], value[1]]);

  useEffect(() => {
    setLocalValue([value[0], value[1]]);
  }, [value]);

  return (
    <RangeSlider
      min={min}
      max={max}
      step={step}
      value={localValue}
      onChange={(val) => {
        setLocalValue(val);
        onValueChange(val);
      }}
      color="indigo"
      size="sm"
    />
  );
}
