import React from 'react';
import { Skeleton as MantineSkeleton } from '@mantine/core';

const Skeleton = ({ width = '100%', height = '20px', borderRadius }) => {
  return <MantineSkeleton width={width} height={height} radius={borderRadius || 'md'} />;
};

export default Skeleton;
