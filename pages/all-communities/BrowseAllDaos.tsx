import React, { FC, useCallback, useState } from 'react';
import { useRouter } from 'next/router';

import { Dropdown } from 'components/dropdown/Dropdown';
import DaoCard from 'components/cards/dao-card';

import { SputnikService } from 'services/SputnikService';
import { DAO } from 'types/dao';

import styles from './browse-all-daos.module.scss';

const sortOptions = [
  {
    label: 'Most active',
    value: 'lastProposalId,DESC'
  },
  {
    label: 'Newest',
    value: 'createdAt,DESC'
  },
  {
    label: 'Oldest',
    value: 'createdAt,ASC'
  },
  {
    label: 'Biggest funds',
    value: 'amount,DESC'
  },
  {
    label: 'Number of members',
    value: 'numberOfMembers,DESC'
  }
];

interface BrowseAllDaosProps {
  data: DAO[];
}

const BrowseAllDaos: FC<BrowseAllDaosProps> = ({ data: initialData = [] }) => {
  const router = useRouter();
  const activeSort = (router.query.sort as string) ?? sortOptions[1].value;

  const [data, setData] = useState(initialData);

  const handleSort = useCallback(
    value => {
      router.push(`?sort=${value}`, undefined, { shallow: true });
      SputnikService.getDaoList({ sort: `${value}` })
        .then(res => setData(res))
        .catch(e => console.error(e));
    },
    [router]
  );

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1>Browse all DAOs</h1>
      </div>
      <div className={styles.filter}>
        <Dropdown
          options={sortOptions}
          value={activeSort}
          defaultValue={activeSort}
          onChange={handleSort}
        />
      </div>
      <div className={styles.content}>
        {data.map(item => (
          <DaoCard
            key={item.id}
            title={item.name}
            daoAccountName={item.id}
            description={item.description}
            activeProposals={item.proposals}
            funds={item.funds}
            members={item.members}
          />
        ))}
      </div>
    </div>
  );
};

export default BrowseAllDaos;
