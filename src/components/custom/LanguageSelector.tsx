'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  arabic,
  chinese,
  french,
  japanese,
  LanguageEnum,
} from '@/app/languages';

interface LanguageSelectorProps {
  defaultValue: LanguageEnum;
  onChange?: (value: LanguageEnum) => void;
}

const languageOptions = [
  { value: chinese, label: chinese, flag: '🇨🇳' },
  { value: japanese, label: japanese, flag: '🇯🇵' },
  { value: arabic, label: arabic, flag: '🇸🇩' },
  { value: french, label: french, flag: '🇫🇷🇫' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  defaultValue,
  onChange,
}) => {
  const [selected, setSelected] = React.useState(defaultValue);

  const handleChange = (value: LanguageEnum) => {
    setSelected(value);
    onChange?.(value);
  };

  return (
    <Select value={selected} onValueChange={handleChange}>
      <SelectTrigger className='w-fit my-auto'>
        <SelectValue>
          {languageOptions.find((lang) => lang.value === selected)?.flag}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
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
