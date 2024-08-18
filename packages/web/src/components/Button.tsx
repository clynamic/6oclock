import styled from "styled-components";

export const Button = styled.button`
  background-color: var(--control);
  color: var(--on-control);
  border: none;
  border-radius: var(--control-radius);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-dark);
  }
`;
