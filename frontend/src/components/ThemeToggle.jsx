import React from 'react';
import { SegmentedControl, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';

export default function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      value={colorScheme}
      onChange={setColorScheme}
      size="xs"
      data={[
        {
          value: 'light',
          label: <IconSun size={16} />,
        },
        {
          value: 'dark',
          label: <IconMoon size={16} />,
        },
        {
          value: 'auto',
          label: <IconDeviceDesktop size={16} />,
        },
      ]}
    />
  );
}
