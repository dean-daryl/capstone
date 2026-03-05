import { useState, useEffect } from 'react';
import { Modal, Button, Group, Stack, Text } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { TimeRangeSlider } from './TimeRangeSlider';

interface TimestampModalProps {
  onConfirm: (start: number, end: number) => void;
  onClose: () => void;
  videoDuration: number;
}

export const TimestampModal = ({ onConfirm, onClose, videoDuration }: TimestampModalProps) => {
  const [range, setRange] = useState([0, videoDuration]);

  useEffect(() => {
    setRange([0, videoDuration]);
  }, [videoDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      opened={true}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconClock size={18} />
          <Text fw={600}>Select Video Segment</Text>
        </Group>
      }
      centered
      size="sm"
    >
      <Stack gap="lg" py="md">
        <TimeRangeSlider
          min={0}
          max={videoDuration}
          step={1}
          value={range}
          onValueChange={setRange}
        />
        <Group justify="space-between">
          <Stack align="center" gap={2}>
            <Text size="sm" fw={500}>Start</Text>
            <Text size="sm" c="dimmed">{formatTime(range[0])}</Text>
          </Stack>
          <div style={{ flex: 1, height: 1, background: 'var(--mantine-color-gray-3)', margin: '0 16px' }} />
          <Stack align="center" gap={2}>
            <Text size="sm" fw={500}>End</Text>
            <Text size="sm" c="dimmed">{formatTime(range[1])}</Text>
          </Stack>
        </Group>
      </Stack>
      <Group justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm(range[0], range[1]);
            onClose();
          }}
        >
          Transcribe Segment
        </Button>
      </Group>
    </Modal>
  );
};
