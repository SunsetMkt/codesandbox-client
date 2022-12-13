import { Element, Stack, Text } from '@codesandbox/components';
import styled from 'styled-components';
import { GRID_MAX_WIDTH, GUTTER } from '../VariableGrid';

const StyledWrapper = styled(Stack)`
  width: calc(100% - ${2 * GUTTER}px);
  max-width: ${GRID_MAX_WIDTH} - 2 * ${GUTTER};
  margin: 28px auto 0;
  flex-direction: column;
  gap: 40px;
`;

const StyledDescription = styled(Text)`
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: #999999;
`;

const StyledGrid = styled(Element)`
  margin: 0;
  padding: 0;
  position: relative;
  overflow: hidden;
  display: grid;
  list-style: none;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
  grid-auto-rows: minmax(156px, 1fr);
`;

const StyledGridTitle = styled(Text)`
  margin: 0;
  font-size: 16px;
  line-height: 25px;
  font-weight: 400;
`;

export const EmptyPage = {
  StyledWrapper,
  StyledDescription,
  StyledGrid,
  StyledGridTitle,
};
