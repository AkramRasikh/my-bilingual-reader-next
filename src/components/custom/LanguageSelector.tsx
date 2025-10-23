'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { arabic, chinese, japanese } from '@/app/languages';

// Props interface
interface LanguageSelectorProps {
  defaultValue: 'chinese' | 'japanese' | 'arabic';
  onChange?: (value: string) => void;
}

const languageOptions = [
  { value: chinese, label: chinese, flag: '🇨🇳' },
  { value: japanese, label: japanese, flag: '🇯🇵' },
  { value: arabic, label: arabic, flag: '🇸🇩' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  defaultValue,
  onChange,
}) => {
  const [selected, setSelected] = React.useState(defaultValue);

  const handleChange = (value: string) => {
    setSelected(value);
    onChange?.(value);
  };

  return (
    <Select value={selected} onValueChange={handleChange}>
      <SelectTrigger className='w-fit my-auto'>
        <SelectValue className=''>
          {languageOptions.find((lang) => lang.value === selected)?.flag}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className='w-fit'>
        {languageOptions.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            <span className='mr-2'>{lang.flag}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
