import styled from "styled-components";
import { Button, Card, Center, TextField } from "../components";

const StyledLoginPage = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledLoginCard = styled(Card)`
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const LoginPage = () => {
  return (
    <StyledLoginPage>
      <Center>
        <StyledLoginCard>
          <h1>6 o'clock</h1>
          <p>Log in to your account</p>
          <TextField placeholder="Username" />
          <TextField placeholder="Password" type="password" />
          <Button>Log in</Button>
        </StyledLoginCard>
      </Center>
    </StyledLoginPage>
  );
};
