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

    const text = grade === 'neutral' ? '→' : grade === 'rise' ? '↗' : '↘';
    const overlap = -size * 0.2;

    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          flexDirection: 'row',
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <IconComponent
            key={index}
            style={{
              ...iconStyle,
              marginRight: index < count - 1 ? overlap : 0,
            }}
          />
        ))}
        <Box
          component="span"
          sx={{
            ...iconStyle,
            opacity: 0,
            position: 'absolute',
            whiteSpace: 'nowrap',
          }}
        >
          {Array.from({ length: count })
            .map(() => text)
            .join('')}
        </Box>
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
