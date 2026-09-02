import { Box } from '@mui/material';
import { mix } from 'polished';

import { PerformanceGrade } from '../api';
import { getScoreGradeColor } from './color';

const reliefShadow =
  'inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 -1px 0 rgba(0, 0, 0, 0.35)';

export const GradeBadge: React.FC<{
  grade: PerformanceGrade;
  size?: number;
}> = ({ grade, size = 56 }) => {
  const color = getScoreGradeColor(grade);
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 1,
        boxShadow: reliefShadow,
        fontSize: Math.round(size * 0.36),
        fontWeight: 'bold',
        backgroundColor: mix(0.25, '#808080', color ?? 'transparent'),
      }}
    >
      {grade}
    </Box>
  );
};
