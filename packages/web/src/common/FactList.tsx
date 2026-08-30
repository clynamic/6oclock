import { Skeleton, Stack, Typography } from '@mui/material';

export interface Fact {
  label: string;
  value?: React.ReactNode;
}

export interface FactListProps {
  facts: Fact[];
}

/**
 * A row of labelled facts, for the things a header would otherwise run together
 * into one dense line.
 */
export const FactCell: React.FC<Fact> = ({ label, value }) => (
  <Stack sx={{ minWidth: 0 }}>
    <Typography
      variant="overline"
      sx={{ color: 'text.disabled', lineHeight: 1.6 }}
    >
      {label}
    </Typography>
    <Typography variant="body2" noWrap>
      {value ?? <Skeleton width={80} />}
    </Typography>
  </Stack>
);

export const FactList: React.FC<FactListProps> = ({ facts }) => {
  return (
    <Stack
      direction="row"
      sx={{ gap: 4, flexWrap: 'wrap', alignItems: 'flex-start', minWidth: 0 }}
    >
      {facts.map((fact) => (
        <FactCell key={fact.label} {...fact} />
      ))}
    </Stack>
  );
};
