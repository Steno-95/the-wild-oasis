import styled from "styled-components";
import LoginForm from "../features/authentication/LoginForm";
import Logo from "../ui/Logo";
import Heading from "../ui/Heading";

const LoginLayout = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 48rem;
  align-content: center;
  justify-content: center;
  gap: 3.2rem;
  background-color: var(--color-grey-50);
`;

const CredentialDisplay = styled.aside`
  background-color: var(--color-blue-700);
  padding: 2rem;
  border: 4px solid var(--color-indigo-100);
  position: absolute;
  bottom: 10%;
  right: 5%;
`;

const CredentialLayout = styled.div`
  display: flex;
  gap: 1.5rem;
`;
const CredentialField = styled.p`
  text-transform: capitalize;
  color: var(--color-grey-50);
  font-weight: 600;
`;
const CredentialValue = styled.span`
  color: var(--color-grey-200);
`;

function Login() {
  return (
    <LoginLayout>
      <Logo />
      <Heading $as="h4">Log in to your account</Heading>
      <LoginForm />
      <CredentialDisplay>
        <CredentialLayout>
          <CredentialField>email address:</CredentialField>
          <CredentialValue>jonas@example.com</CredentialValue>
        </CredentialLayout>
        <CredentialLayout>
          <CredentialField>password:</CredentialField>
          <CredentialValue>pass0897</CredentialValue>
        </CredentialLayout>
      </CredentialDisplay>
    </LoginLayout>
  );
}

export default Login;
