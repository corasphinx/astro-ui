import React, { FC } from 'react';

import { Sidebar } from 'components/sidebar/Sidebar';

import styles from './page-layout.module.scss';

const sidebarItems: React.ComponentProps<typeof Sidebar>['items'] = [
  {
    label: 'Overview',
    href: '#',
    logo: 'stateOverview',
    count: 103,
    subItems: []
  },
  {
    label: 'Tasks',
    href: '#',
    logo: 'stateTasks',
    subItems: [
      {
        label: 'Bounties',
        href: '#'
      },
      {
        label: 'Polls',
        href: '#'
      },
      {
        label: 'Plugins',
        href: '#'
      }
    ]
  },
  {
    label: 'Treasury',
    href: '#',
    logo: 'stateTreasury',
    subItems: [
      {
        label: 'Tokens',
        href: '#'
      },
      {
        label: 'NFTs',
        href: '#'
      },
      {
        label: 'Plugins',
        href: '#'
      }
    ]
  },
  {
    label: 'Governance',
    href: '#',
    logo: 'stateGovernance',
    subItems: [
      {
        label: 'DAO settings',
        href: '/governance/DaoSettings'
      },
      {
        label: 'Voting Policy',
        href: '/governance/VotingPolicy'
      },
      {
        label: 'Voting Token',
        href: '/governance/VotingToken'
      },
      {
        label: 'Upgrade software Token',
        href: '/governance/UpgradeSoftware'
      }
    ]
  }
];

const PageLayout: FC = ({ children }) => {
  return (
    <div className={styles.root}>
      <Sidebar daoList={[]} items={sidebarItems} />
      <header>[PLACEHOLDER] header here</header>
      <main>{children}</main>
    </div>
  );
};

export default PageLayout;