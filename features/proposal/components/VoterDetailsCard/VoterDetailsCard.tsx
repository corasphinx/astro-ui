import React, { FC } from 'react';
import cn from 'classnames';
import dynamic from 'next/dynamic';

import { Icon, IconName } from 'components/Icon';
import { Badge, getBadgeVariant } from 'components/Badge';
import { ExplorerLink } from 'components/ExplorerLink';
import { Vote } from 'features/types';
import { formatTimestampAsDate } from 'utils/format';

import styles from './VoterDetailsCard.module.scss';

const GroupsRenderer = dynamic(
  import('components/cards/member-card/GroupsRenderer'),
  {
    ssr: false,
  }
);

interface VoterDetailsCardProps {
  vote: Vote | null;
  name: string;
  groups?: string[];
  transactionHash: string | undefined;
  timestamp: string | null | undefined;
}

export const VoterDetailsCard: FC<VoterDetailsCardProps> = ({
  vote,
  name,
  groups,
  transactionHash,
  timestamp,
}) => {
  let icon;
  let iconSize = 40;

  switch (vote) {
    case 'Yes': {
      icon = 'votingYes';
      break;
    }
    case 'No': {
      icon = 'votingNo';
      break;
    }
    case 'Dismiss': {
      icon = 'votingDismissAlt';
      iconSize = 24;
      break;
    }
    default: {
      iconSize = 32;
      icon = 'notVoted';
    }
  }

  const selectedItems = groups?.map(n => ({
    label: n,
    component: (
      <Badge size="small" variant={getBadgeVariant(n)}>
        {n}
      </Badge>
    ),
  }));

  return (
    <div className={styles.root}>
      <div
        className={cn(styles.status, {
          [styles.yes]: vote === 'Yes',
          [styles.no]: vote === 'No',
          [styles.dismiss]: vote === 'Dismiss',
          [styles.notVoted]: vote === null,
        })}
      >
        <Icon width={iconSize} name={icon as IconName} />
      </div>
      <div className={styles.name}>{name}</div>
      <div className={styles.groups}>
        <GroupsRenderer selectedItems={selectedItems ?? []} />
      </div>
      <div className={styles.other}>
        &nbsp;
        {timestamp ? formatTimestampAsDate(timestamp) : null}
      </div>
      <div className={styles.link}>
        {vote && (
          <ExplorerLink
            linkData={transactionHash ?? ''}
            linkType="transaction"
            className={styles.linkItem}
          />
        )}
      </div>
    </div>
  );
};