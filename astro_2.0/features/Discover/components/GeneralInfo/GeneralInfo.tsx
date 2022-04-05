import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAsyncFn, useMountedState } from 'react-use';

import { ControlTabs } from 'astro_2.0/features/Discover/components/ControlTabs';
import { DaosTopList } from 'astro_2.0/features/Discover/components/DaosTopList';
import { ChartRenderer } from 'astro_2.0/features/Discover/components/ChartRenderer';

import {
  LeaderboardData,
  TControlTab,
} from 'astro_2.0/features/Discover/types';
import { ChartDataElement } from 'components/AreaChartRenderer/types';
import { useDaoStatsContext } from 'astro_2.0/features/Discover/DaoStatsDataProvider';
import { LIMIT } from 'services/DaoStatsService';

import {
  CONTRACT,
  DaoStatsTopics,
  GeneralInfoTabs,
} from 'astro_2.0/features/Discover/constants';
import { getValueLabel } from 'astro_2.0/features/Discover/helpers';
import { ChartInterval } from 'astro_2.0/features/Discover/components/ChartInterval';
import useQuery from 'hooks/useQuery';

import { General, Interval } from 'services/DaoStatsService/types';

import styles from './GeneralInfo.module.scss';

export const GeneralInfo: FC = () => {
  const isMounted = useMountedState();
  const { t } = useTranslation();
  const [interval, setInterval] = useState(Interval.WEEK);
  const { daoStatsService } = useDaoStatsContext();
  const [generalData, setGeneralData] = useState<General | null>(null);
  const [chartData, setChartData] = useState<ChartDataElement[] | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<
    LeaderboardData[] | null
  >(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const { query } = useQuery<{ dao: string }>();

  const items = useMemo<TControlTab[]>(() => {
    if (query.dao) {
      return [
        {
          id: GeneralInfoTabs.ACTIVITY,
          label: t('discover.activity'),
          value: (generalData?.activity.count ?? 0).toLocaleString(),
          trend: generalData?.activity.growth ?? 0,
        },
      ];
    }

    return [
      {
        id: GeneralInfoTabs.ACTIVE_DAOS,
        label: t('discover.activeDaos'),
        value: (generalData?.activity.count ?? 0).toLocaleString(),
        trend: generalData?.activity.growth ?? 0,
      },
    ];
  }, [generalData?.activity.count, generalData?.activity.growth, query.dao, t]);
  const [activeView, setActiveView] = useState(items[0].id);

  const handleTopicSelect = useCallback(
    async (id: string) => {
      if (!isMounted()) {
        return;
      }

      setChartData(null);
      setLeaderboardData(null);
      setActiveView(id);
    },
    [isMounted]
  );

  useEffect(() => {
    (async () => {
      const general = query.dao
        ? await daoStatsService.getGeneralDao({ ...CONTRACT, dao: query.dao })
        : await daoStatsService.getGeneral(CONTRACT);

      if (general.data && isMounted()) {
        setGeneralData(general.data);
      }
    })();
  }, [daoStatsService, isMounted, query.dao]);

  const [{ loading }, getChartData] = useAsyncFn(async () => {
    let data;

    if (query.dao) {
      const params = {
        ...CONTRACT,
        dao: query.dao,
      };

      switch (activeView) {
        case GeneralInfoTabs.ACTIVITY:
        default: {
          data = await daoStatsService.getGeneralDaoActivity({
            ...params,
            interval,
          });
          break;
        }
      }
    } else {
      switch (activeView) {
        case GeneralInfoTabs.ACTIVE_DAOS:
        default: {
          data = await daoStatsService.getGeneralActive({
            ...CONTRACT,
            interval,
          });
          break;
        }
      }
    }

    if (data && isMounted()) {
      setChartData(
        data.data.metrics.map(({ timestamp, count }) => ({
          x: new Date(timestamp),
          y: count,
        }))
      );
    }
  }, [activeView, query.dao, isMounted]);

  const [, getLeaderboardData] = useAsyncFn(async () => {
    if (query.dao) {
      return;
    }

    let leadersData;

    switch (activeView) {
      case GeneralInfoTabs.ACTIVE_DAOS:
      default: {
        leadersData = await daoStatsService.getGeneralActiveLeaderboard({
          ...CONTRACT,
          limit: LIMIT,
          offset,
        });
        break;
      }
    }

    if (leadersData?.data?.metrics && isMounted()) {
      const newData =
        leadersData.data.metrics.map(metric => ({
          ...metric,
          overview:
            metric.overview?.map(({ timestamp, count }) => ({
              x: new Date(timestamp),
              y: count,
            })) ?? [],
        })) ?? null;

      setTotal(leadersData.data.total);
      setLeaderboardData(
        leaderboardData ? [...leaderboardData, ...newData] : newData
      );
    }
  }, [interval, activeView, query.dao, isMounted, offset]);

  useEffect(() => {
    getChartData();
  }, [getChartData]);

  useEffect(() => {
    getLeaderboardData();
  }, [getLeaderboardData]);

  const nextLeaderboardItems = () => {
    setOffset(offset + LIMIT);
  };

  return (
    <>
      <ControlTabs
        loading={loading}
        className={styles.header}
        items={items}
        onSelect={handleTopicSelect}
        activeView={activeView}
      />
      <div className={styles.body}>
        <ChartRenderer
          data={chartData}
          loading={loading}
          activeView={activeView}
        />
        {!loading ? (
          <ChartInterval
            interval={interval}
            setInterval={value => setInterval(value as Interval)}
          />
        ) : null}
        <DaosTopList
          total={total}
          next={nextLeaderboardItems}
          data={leaderboardData}
          valueLabel={getValueLabel(DaoStatsTopics.GENERAL_INFO, activeView)}
        />
      </div>
    </>
  );
};
