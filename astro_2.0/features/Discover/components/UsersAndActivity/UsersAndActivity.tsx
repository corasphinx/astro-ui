import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAsyncFn } from 'react-use';

import { ControlTabs } from 'astro_2.0/features/Discover/components/ControlTabs';
import { ChartRenderer } from 'astro_2.0/features/Discover/components/ChartRenderer';
import { DaosTopList } from 'astro_2.0/features/Discover/components/DaosTopList';

import {
  LeaderboardData,
  TControlTab,
} from 'astro_2.0/features/Discover/types';
import { ChartDataElement } from 'components/AreaChartRenderer/types';

import { daoStatsService } from 'services/DaoStatsService';

import { getValueLabel } from 'astro_2.0/features/Discover/helpers';
import {
  CONTRACT,
  DaoStatsTopics,
  UsersAndActivityTabs,
} from 'astro_2.0/features/Discover/constants';

import { dFormatter } from 'utils/format';
import useQuery from 'hooks/useQuery';

import { Users } from 'services/DaoStatsService/types';

import styles from './UsersAndActivity.module.scss';

export const UsersAndActivity: FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Users | null>(null);
  const [chartData, setChartData] = useState<ChartDataElement[] | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<
    LeaderboardData[] | null
  >(null);

  const { query } = useQuery<{ dao: string }>();

  const items = useMemo<TControlTab[]>(() => {
    if (query.dao) {
      return [
        {
          id: UsersAndActivityTabs.ALL_USERS_PER_DAO,
          label: t('discover.allUsersPerDao'),
          value: (data?.users.count ?? 0).toLocaleString(),
          trend: data?.users.growth ?? 0,
        },
        {
          id: UsersAndActivityTabs.USERS_MEMBERS_OF_DAO,
          label: t('discover.usersMembersOfDao'),
          value: (data?.members.count ?? 0).toLocaleString(),
          trend: data?.members.growth ?? 0,
        },
        {
          id: UsersAndActivityTabs.NUMBER_OF_INTERACTIONS,
          label: t('discover.numberOfInteractions'),
          value: Number(
            dFormatter(data?.interactions.count ?? 0, 2)
          ).toLocaleString(),
          trend: data?.interactions.growth ?? 0,
        },
      ];
    }

    return [
      {
        id: UsersAndActivityTabs.ALL_USERS_ON_PLATFORM,
        label: t('discover.allUsersOnAPlatform'),
        value: (data?.users.count ?? 0).toLocaleString(),
        trend: data?.users.growth ?? 0,
      },
      {
        id: UsersAndActivityTabs.USERS_MEMBERS_OF_DAO,
        label: t('discover.usersMembersOfDao'),
        value: (data?.members.count ?? 0).toLocaleString(),
        trend: data?.members.growth ?? 0,
      },
      {
        id: UsersAndActivityTabs.AVERAGE_NUMBER_OF_USERS_PER_DAO,
        label: t('discover.averageNumberOfUsersPerDao'),
        value: (data?.averageUsers.count ?? 0).toLocaleString(),
        trend: data?.averageUsers.growth ?? 0,
      },
      {
        id: UsersAndActivityTabs.NUMBER_OF_INTERACTIONS,
        label: t('discover.numberOfInteractions'),
        value: Number(
          dFormatter(data?.interactions.count ?? 0, 2)
        ).toLocaleString(),
        trend: data?.interactions.growth ?? 0,
      },
      {
        id: UsersAndActivityTabs.AVERAGE_NUMBER_OF_INTERACTIONS_PER_DAO,
        label: t('discover.averageNumberOfInteractionsPerDao'),
        value: Number(
          dFormatter(data?.averageInteractions.count ?? 0, 2)
        ).toLocaleString(),
        trend: data?.averageInteractions.growth ?? 0,
      },
    ];
  }, [
    data?.averageInteractions.count,
    data?.averageInteractions.growth,
    data?.averageUsers.count,
    data?.averageUsers.growth,
    data?.interactions.count,
    data?.interactions.growth,
    data?.members.count,
    data?.members.growth,
    data?.users.count,
    data?.users.growth,
    query.dao,
    t,
  ]);
  const [activeView, setActiveView] = useState<string>(items[0].id);

  const handleTopicSelect = useCallback(async (id: string) => {
    setChartData(null);
    setLeaderboardData(null);
    setActiveView(id);
  }, []);

  useEffect(() => {
    (async () => {
      const response = query.dao
        ? await daoStatsService.getUsersDao({ ...CONTRACT, dao: query.dao })
        : await daoStatsService.getUsers(CONTRACT);

      if (response.data) {
        setData(response.data);
      }
    })();
  }, [query.dao]);

  const [{ loading }, getChartData] = useAsyncFn(async () => {
    let chart;
    let leaders;

    if (query.dao) {
      const params = {
        ...CONTRACT,
        dao: query.dao,
      };

      switch (activeView) {
        case UsersAndActivityTabs.USERS_MEMBERS_OF_DAO: {
          chart = await daoStatsService.getUsersDaoMembers(params);
          break;
        }
        case UsersAndActivityTabs.NUMBER_OF_INTERACTIONS: {
          chart = await daoStatsService.getUsersDaoInteractions(params);
          break;
        }
        case UsersAndActivityTabs.ALL_USERS_ON_PLATFORM:
        default: {
          chart = await daoStatsService.getUsersDaoUsers(params);
          break;
        }
      }
    } else {
      switch (activeView) {
        case UsersAndActivityTabs.USERS_MEMBERS_OF_DAO: {
          chart = await daoStatsService.getUsersMembers(CONTRACT);
          leaders = await daoStatsService.getUsersMembersLeaderboard(CONTRACT);
          break;
        }
        case UsersAndActivityTabs.AVERAGE_NUMBER_OF_USERS_PER_DAO: {
          chart = await daoStatsService.getUsersAverageUsers(CONTRACT);
          break;
        }
        case UsersAndActivityTabs.NUMBER_OF_INTERACTIONS: {
          chart = await daoStatsService.getUsersInteractions(CONTRACT);
          leaders = await daoStatsService.getUsersInteractionsLeaderboard(
            CONTRACT
          );
          break;
        }
        case UsersAndActivityTabs.AVERAGE_NUMBER_OF_INTERACTIONS_PER_DAO: {
          chart = await daoStatsService.getUsersAverageInteractions(CONTRACT);
          break;
        }
        case UsersAndActivityTabs.ALL_USERS_ON_PLATFORM:
        default: {
          chart = await daoStatsService.getUsersUsers(CONTRACT);
          leaders = await daoStatsService.getUsersLeaderboard(CONTRACT);
          break;
        }
      }
    }

    if (chart) {
      setChartData(
        chart.data.metrics.map(({ timestamp, count }) => ({
          x: new Date(timestamp),
          y: count,
        }))
      );
    }

    if (leaders?.data?.metrics) {
      const newData =
        leaders.data.metrics.map(metric => {
          return {
            ...metric,
            overview:
              metric.overview?.map(({ timestamp, count }) => ({
                x: new Date(timestamp),
                y: count,
              })) ?? [],
          };
        }) ?? null;

      setLeaderboardData(newData);
    }
  }, [activeView, query.dao]);

  useEffect(() => {
    getChartData();
  }, [getChartData]);

  return (
    <div className={styles.root}>
      <ControlTabs
        className={styles.header}
        items={items}
        onSelect={handleTopicSelect}
        activeView={activeView}
        loading={loading}
      />
      <div className={styles.body}>
        <ChartRenderer
          data={chartData}
          loading={loading}
          activeView={activeView}
        />
        <DaosTopList
          data={leaderboardData}
          valueLabel={getValueLabel(
            DaoStatsTopics.USERS_AND_ACTIVITY,
            activeView
          )}
        />
      </div>
    </div>
  );
};