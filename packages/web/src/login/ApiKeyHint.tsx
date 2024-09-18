import { Grow, Link, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Control, useWatch } from 'react-hook-form';

import { LoginFormData } from './type';

export interface ApiKeyHintProps {
  control: Control<LoginFormData, unknown>;
}

export const ApiKeyHint: React.FC<ApiKeyHintProps> = ({ control }) => {
  const username = useWatch({ control, name: 'username' });
  const password = useWatch({ control, name: 'password' });
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowHint(!!username && !password);
    }, 500);
    return () => clearTimeout(timeout);
  }, [username, password]);

  return (
    <Grow in={showHint}>
      <Typography variant="caption">
        Get your API key from{' '}
        <Link
          href={`https://e621.net/users/${encodeURIComponent(
            username as string,
          )}/api_key`}
          target="_blank"
          rel="noreferrer 
        "
        >
          here
        </Link>
        .
      </Typography>
    </Grow>
  );
};
