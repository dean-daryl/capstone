import React from 'react';
import { Badge, Anchor } from '@mantine/core';
import { IconFileText, IconExternalLink } from '@tabler/icons-react';

interface SourceCardProps {
  filename: string;
  score: number;
  documentUrl?: string;
  onClick: () => void;
}

export const SourceCard: React.FC<SourceCardProps> = ({
  filename,
  score,
  documentUrl,
  onClick,
}) => {
  const percentage = Math.round(score * 100);

  return (
    <Badge
      variant="light"
      color="indigo"
      size="lg"
      radius="xl"
      leftSection={<IconFileText size={12} />}
      rightSection={
        documentUrl ? (
          <Anchor
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onClick();
            }}
            c="indigo"
            style={{ display: 'flex' }}
          >
            <IconExternalLink size={12} />
          </Anchor>
        ) : undefined
      }
      style={{ cursor: 'pointer', textTransform: 'none', fontWeight: 500 }}
      onClick={onClick}
    >
      {filename.length > 15 ? filename.slice(0, 15) + '...' : filename} {percentage}%
    </Badge>
  );
};
