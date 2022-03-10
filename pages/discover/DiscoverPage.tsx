import { NextPage } from 'next';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import cn from 'classnames';
import { useMedia } from 'react-use';

import { Button } from 'components/button/Button';
import { SearchInput } from 'astro_2.0/components/SearchInput';
import { SideFilter } from 'astro_2.0/components/SideFilter';
import { ContentPanel } from 'astro_2.0/features/Discover/components/ContentPanel';
import { GeneralInfo } from 'astro_2.0/features/Discover/components/GeneralInfo';
import { UsersAndActivity } from 'astro_2.0/features/Discover/components/UsersAndActivity';
import { Governance } from 'astro_2.0/features/Discover/components/Governance';
import { Flow } from 'astro_2.0/features/Discover/components/Flow';
import { Tvl } from 'astro_2.0/features/Discover/components/Tvl';
import { Tokens } from 'astro_2.0/features/Discover/components/Tokens';
import { SelectedDaoDetails } from 'astro_2.0/features/Discover/components/SelectedDaoDetails';

import { useDaoSearch } from 'astro_2.0/features/Discover/hooks';
import { useAuthContext } from 'context/AuthContext';

import { CREATE_DAO_URL } from 'constants/routing';

import { DaoStatsTopics } from 'astro_2.0/features/Discover/constants';
import useQuery from 'hooks/useQuery';

import styles from './DiscoverPage.module.scss';

const DiscoverPage: NextPage = () => {
  const { t } = useTranslation();
  const { accountId, login } = useAuthContext();
  const router = useRouter();
  const { query } = router;
  const topic = query.topic as string;
  const isMobile = useMedia('(max-width: 1280px)');

  const { loading, handleSearch } = useDaoSearch();

  const { query: searchQuery, updateQuery } = useQuery<{
    dao: string;
  }>({ shallow: false });

  const handleCreateDao = useCallback(
    () => (accountId ? router.push(CREATE_DAO_URL) : login()),
    [login, router, accountId]
  );

  const [overviewOptions, financialOptions] = useMemo(() => {
    let overview = [
      {
        label: t('discover.generalInfo'),
        value: DaoStatsTopics.GENERAL_INFO,
      },
      {
        label: t('discover.usersAndActivity'),
        value: DaoStatsTopics.USERS_AND_ACTIVITY,
      },
      {
        label: t('discover.governance'),
        value: DaoStatsTopics.GOVERNANCE,
      },
    ];

    let financial = [
      {
        label: t('discover.flow'),
        value: DaoStatsTopics.FLOW,
      },
      {
        label: t('discover.tvl'),
        value: DaoStatsTopics.TVL,
      },
      {
        label: t('discover.tokens'),
        value: DaoStatsTopics.TOKENS,
      },
    ];

    if (isMobile) {
      overview = [...overview, ...financial];
      financial = [];
    }

    return [overview, financial];
  }, [isMobile, t]);

  useEffect(() => {
    if (!topic) {
      router.replace(
        {
          pathname: router.pathname,
          query: {
            ...query,
            topic: 'generalInfo',
          },
        },
        undefined,
        {
          shallow: true,
        }
      );
    }
  }, [query, router, topic]);

  function renderContent() {
    switch (topic) {
      case DaoStatsTopics.GENERAL_INFO: {
        return <GeneralInfo />;
      }
      case DaoStatsTopics.USERS_AND_ACTIVITY: {
        return <UsersAndActivity />;
      }
      case DaoStatsTopics.GOVERNANCE: {
        return <Governance />;
      }
      case DaoStatsTopics.FLOW: {
        return <Flow />;
      }
      case DaoStatsTopics.TVL: {
        return <Tvl />;
      }
      case DaoStatsTopics.TOKENS: {
        return <Tokens />;
      }
      default: {
        return null;
      }
    }
  }

  if (!topic) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.row}>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>{t('discover.title')}</h1>
            <Button variant="black" size="small" onClick={handleCreateDao}>
              {t('createNewDao')}
            </Button>
          </div>
          <SearchInput
            key={searchQuery.dao}
            placeholder="Search DAO name"
            className={styles.search}
            onSubmit={handleSearch}
            showResults
            loading={loading}
            renderResult={res => {
              return (
                <Button
                  key={res.id}
                  variant="transparent"
                  size="block"
                  onClick={() => updateQuery('dao', res.id)}
                >
                  <div className={styles.searchResult}>
                    {res.name ?? res.id}
                  </div>
                </Button>
              );
            }}
          />
        </div>
        <SelectedDaoDetails />
      </div>
      <div className={styles.sidebar}>
        <SideFilter
          shallowUpdate
          hideAllOption
          queryName="topic"
          list={overviewOptions}
          title={t('discover.overview')}
          titleClassName={styles.sideFilterTitle}
          className={styles.sideFilter}
        />
        {financialOptions.length > 0 && (
          <SideFilter
            shallowUpdate
            hideAllOption
            queryName="topic"
            list={financialOptions}
            title={t('discover.financial')}
            titleClassName={styles.sideFilterTitle}
            className={cn(styles.sideFilter, styles.financialFilter)}
          />
        )}
      </div>
      <div className={styles.body}>
        <ContentPanel title={t(`discover.${topic}`)}>
          {renderContent()}
        </ContentPanel>
      </div>
    </div>
  );
};

export default DiscoverPage;