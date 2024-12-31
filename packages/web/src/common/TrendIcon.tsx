import { TrendingDown, TrendingFlat, TrendingUp } from '@mui/icons-material';
import { Box } from '@mui/material';

import { TrendGrade } from '../api';

type TrendIconProps = {
  grade: TrendGrade;
  size?: number;
};

export const TrendIcon: React.FC<TrendIconProps> = ({ grade, size = 20 }) => {
  const iconStyle = {
    fontSize: size,
    position: 'absolute' as const,
  };

  const iconMap = {
    plummet: 3,
    drop: 2,
    decline: 1,
    neutral: 1,
    rise: 1,
    climb: 2,
    surge: 3,
  };

  const getIcon = (grade: TrendGrade) => {
    const count = iconMap[grade];
    const IconComponent =
      grade === 'neutral'
        ? TrendingFlat
        : grade.includes('rise') ||
            grade.includes('climb') ||
            grade.includes('surge')
          ? TrendingUp
          : TrendingDown;
    const spacing = size * 0.8;

    return (
      <Box
        component="span"
        sx={{
          position: 'relative',
          width: size + spacing * (count - 1),
          height: size,
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <IconComponent
            key={index}
            style={{
              ...iconStyle,
              left: index * spacing,
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',

        verticalAlign: 'middle',
      }}
    >
      {getIcon(grade)}
    </Box>
  );
};
