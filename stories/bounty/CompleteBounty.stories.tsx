import React from 'react';
import { Meta, Story } from '@storybook/react';

import {
  CompleteBountyDialog,
  CompleteBountyDialogProps
} from 'features/bounty/dialogs/complete-bounty-dialog/CompleteBountyDialog';

export default {
  title: 'Features/Bounty/Dialogs/CompleteBounty',
  component: CompleteBountyDialog
} as Meta;

export const Template: Story<CompleteBountyDialogProps> = (
  args
): JSX.Element => <CompleteBountyDialog {...args} />;

Template.storyName = 'CompleteBounty';
Template.args = {
  isOpen: true,
  data: {
    type: 'Passed',
    status: 'In progress',
    token: 'NEAR',
    amount: 112,
    group:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.',
    externalUrl: '',
    slots: 3,
    claimed: 1,
    claimedBy: [
      {
        name: 'annie.near',
        datetime: '2021-08-01'
      }
    ],
    claimedByMe: true,
    deadlineThreshold: 8,
    deadlineUnit: 'week',
    voteDetails: [
      { value: '50%', label: 'MEW holders' },
      { value: '50%', label: 'cool group' },
      { value: '1 person', label: 'Ombudspeople' }
    ],
    bondDetail: {
      value: 0.3,
      token: 'NEAR'
    }
  }
};