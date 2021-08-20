import { Meta, Story } from '@storybook/react';
import {
  ProposalTrackerCard,
  ProposalTrackerProps
} from 'components/cards/proposal-tracker-card/ProposalTrackerCard';
import { Icon } from 'components/Icon';
import React from 'react';

export default {
  title: 'Features/DAO Home/Cards/Proposal Tracker',
  component: ProposalTrackerCard,
  parameters: {
    backgrounds: {
      default: 'light'
    }
  }
} as Meta;

export const Template: Story<ProposalTrackerProps> = (args): JSX.Element => (
  <ProposalTrackerCard {...args} />
);

Template.storyName = 'Proposal Tracker';
Template.args = {
  title: '8 active votes',
  subtitle: '132 proposals in total',
  action: (
    <>
      <Icon name="buttonAdd" width={24} /> Create proposal
    </>
  )
};