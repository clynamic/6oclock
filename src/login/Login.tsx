import {
  Box,
  Card,
  CardActions,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth";
import { getAuthToken } from "../http";
import { PageBody, PageFooter, PageHeader, PageTitle } from "../page";
import { Page } from "../page/Page";
import { ApiKeyField } from "./ApiKeyField";
import { ApiKeyHint } from "./ApiKeyHint";
import { LoginButton } from "./LoginButton";
import { LoginFormData } from "./type";
import { UsernameField } from "./UsernameField";

export const LoginPage = () => {
  const navigation = useNavigate();
  const [redirect, setRedirect] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>();

  const [loading, setLoading] = useState(false);
  const { saveToken } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get("redirect");
    if (redirect) {
      const value = decodeURIComponent(redirect);
      if (value.startsWith("/")) {
        setRedirect(value);
      } else {
        console.error("Invalid redirect URL", value);
      }
      searchParams.delete("redirect");
      navigation({ search: searchParams.toString() }, { replace: true });
    }
  }, [navigation]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const token = await getAuthToken(data);
      saveToken(token);
    } catch {
      control.setError("password", { message: "Invalid credentials" });
      setLoading(false);
      return;
    }
    setLoading(false);
    navigation(redirect || "/");
  };

  return (
    <Page>
      <PageTitle subtitle="Punch in!" />
      <PageHeader />
      <PageBody>
        <Container
          maxWidth="sm"
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{ width: "100%" }}
            component={"form"}
            onSubmit={handleSubmit(onSubmit)}
          >
            <Card sx={{ width: "100%" }}>
              <CardContent
                sx={{
                  p: {
                    xs: 2,
                    sm: 4,
                  },
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h4">6 o'clock</Typography>
                  <Typography variant="body1">
                    Welcome back! Log in to continue.
                  </Typography>
                  <UsernameField control={control} errors={errors} />
                  <ApiKeyField control={control} errors={errors} />
                  <ApiKeyHint control={control} />
                </Stack>
              </CardContent>
              <CardActions>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                    p: 1,
                  }}
                >
                  <LoginButton loading={loading} />
                </Box>
              </CardActions>
            </Card>
          </Box>
        </Container>
      </PageBody>
      <PageFooter />
    </Page>
  );
};
