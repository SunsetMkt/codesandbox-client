import React from 'react';
import track from '@codesandbox/common/lib/utils/analytics';
import { IconButton, Stack, Text, Switch } from '@codesandbox/components';
import { useActions, useAppState } from 'app/overmind';
import styled from 'styled-components';
import { useWorkspaceSubscription } from 'app/hooks/useWorkspaceSubscription';
import {
  CreditAddon,
  SubscriptionPackage,
} from 'app/overmind/namespaces/checkout/types';
import { fadeAnimation } from './elements';
import { WorkspaceFlow } from './types';

export const Summary: React.FC<{
  allowChanges: boolean;
  flow: WorkspaceFlow;
}> = ({ allowChanges, flow }) => {
  const actions = useActions();
  const { isPro } = useWorkspaceSubscription();
  const { checkout } = useAppState();
  const {
    currentSubscription,
    newSubscription,
    spendingLimit,
    hasUpcomingChange,
  } = checkout;

  const isAnnual = newSubscription?.basePlan.id === 'flex-annual';
  const allowAnnualSwitch = flow !== 'manage-addons';

  return (
    <Stack
      gap={16}
      direction="vertical"
      css={{
        padding: '64px 48px',
        '@media (max-width: 1330px)': {
          padding: '64px 24px',
        },
      }}
    >
      {currentSubscription && hasUpcomingChange && (
        <PlanSummary
          title="Current plan"
          subscriptionPackage={currentSubscription}
          editable={false}
        />
      )}

      {newSubscription && (
        <PlanSummary
          title={currentSubscription ? 'New plan' : 'Plan summary'}
          subscriptionPackage={newSubscription}
          editable={allowChanges}
          onIncrementItem={addon => {
            actions.checkout.addCreditsPackage(addon);
            track('Checkout - Increment Addon Item', {
              from: flow,
              currentPlan: isPro ? 'pro' : 'free',
            });
          }}
          onDecrementItem={addon => {
            actions.checkout.removeCreditsPackage(addon);
            track('Checkout - Decrement Addon Item', {
              from: flow,
              currentPlan: isPro ? 'pro' : 'free',
            });
          }}
        />
      )}

      {allowAnnualSwitch && (
        <Stack css={{ gap: '8px' }}>
          <Switch
            id="recurring"
            on={isAnnual}
            onChange={() => {
              actions.checkout.selectPlan(isAnnual ? 'flex' : 'flex-annual');

              track('Checkout - Toggle recurring type', {
                from: flow,
                newValue: isAnnual ? 'annual' : 'monthly',
              });
            }}
          />
          <Stack direction="vertical" css={{ marginTop: -3 }}>
            <Text color="#fff" as="label" htmlFor="recurring">
              Annual (Save 30%)
            </Text>

            {isAnnual && <Text>24 hour processing time</Text>}
          </Stack>
        </Stack>
      )}

      <Text size={3}>
        Additional VM credits are available on-demand for $0.018/credit.
        <br />
        Spending limit: ${spendingLimit}
      </Text>
    </Stack>
  );
};

interface PlanSummaryProps {
  title: string;
  subscriptionPackage: SubscriptionPackage;
  editable: boolean;
  onDecrementItem?: (addon: CreditAddon) => void;
  onIncrementItem?: (addon: CreditAddon) => void;
}

const PlanSummary: React.FC<PlanSummaryProps> = ({
  title,
  subscriptionPackage,
  editable,
  onDecrementItem,
  onIncrementItem,
}) => (
  <Stack direction="vertical" gap={6}>
    <Text size={6} color="#fff">
      {title}
    </Text>

    <Stack
      direction="vertical"
      gap={4}
      css={{ paddingBottom: '24px', borderBottom: '1px solid #5C5C5C' }}
    >
      <Stack direction="horizontal" justify="space-between" gap={2}>
        <Stack direction="vertical">
          <Text color="#fff">
            {subscriptionPackage.basePlan.name} plan base
          </Text>
          <Text>{subscriptionPackage.basePlan.credits} VM credits</Text>
        </Stack>
        <Text color="#fff">${subscriptionPackage.basePlan.price}</Text>
      </Stack>

      {subscriptionPackage.addonItems.map(item => (
        <AnimatedLineItem
          direction="horizontal"
          key={item.addon.id}
          align="center"
          justify="space-between"
          gap={2}
        >
          <Text color="#fff">{item.addon.credits} VM credits</Text>
          <Stack align="center">
            {editable && (
              <QuantityCounter
                quantity={item.quantity}
                onIncrement={() => onIncrementItem?.(item.addon)}
                onDecrement={() => onDecrementItem?.(item.addon)}
              />
            )}

            <Text color="#fff" css={{ width: '48px', textAlign: 'right' }}>
              ${item.quantity * item.addon.price}
            </Text>
          </Stack>
        </AnimatedLineItem>
      ))}
    </Stack>

    <Stack justify="space-between">
      <Stack direction="vertical">
        <Text color="#fff">
          Total cost per{' '}
          {subscriptionPackage.basePlan.id === 'flex-annual' ? 'year' : 'month'}
        </Text>
        <Text>{subscriptionPackage.totalCredits} VM credits</Text>
      </Stack>

      <Text color="#fff">${subscriptionPackage.totalPrice}</Text>
    </Stack>
  </Stack>
);

const AnimatedLineItem = styled(Stack)`
  animation: ${fadeAnimation};
  height: 28px;
`;

const QuantityCounter: React.FC<{
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}> = ({ quantity, onIncrement, onDecrement }) => {
  return (
    <Stack
      align="center"
      justify="space-between"
      css={{ border: '1px solid #5c5c5c', borderRadius: '4px', width: '84px' }}
    >
      <IconButton
        title={quantity === 1 ? 'Remove addon' : 'Decrease quantity'}
        onClick={onDecrement}
        variant="square"
        name="minus"
        css={{ borderRadius: '3px 0 0 3px' }} // 3px fills the space inside the 4px border radius wrapper
      />
      <Text color="#fff">{quantity}</Text>
      <IconButton
        title="Increase quantity"
        onClick={onIncrement}
        name="plus"
        variant="square"
        css={{ borderRadius: '0 3px 3px 0' }}
      />
    </Stack>
  );
};
