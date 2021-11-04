import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import classNames from 'classnames';

import { useAuthContext } from 'context/AuthContext';
import { useNearPrice } from 'hooks/useNearPrice';
import { formatCurrency } from 'utils/formatCurrency';

import { Icon } from 'components/Icon';
import { Button } from 'components/button/Button';
import { DaoAddressLink } from 'components/dao-address';
import { CopyButton } from 'features/copy-button';

import { TokenCard } from 'components/cards/token-card';
import { Token, TokenDeprecated } from 'types/token';

import { ChartCaption } from 'components/area-chart/components/chart-caption';
import { ChartData } from 'lib/types/treasury';

import { TransactionCard } from 'components/cards/transaction-card';
import { Receipt } from 'types/transaction';
import { Pagination } from 'components/pagination';

import styles from 'pages/dao/[dao]/treasury/tokens/tokens.module.scss';
import { DAO } from 'types/dao';
import { DaoDetailsMinimized } from 'astro_2.0/components/DaoDetails';
import { CreateProposal } from 'astro_2.0/features/CreateProposal';
import { ProposalVariant } from 'types/proposal';

export interface TokensPageProps {
  data: {
    chartData: ChartData[];
    daoTokens: Token[];
    totalValue: string;
    receipts: Receipt[];
    dao: DAO | null;
  };
}

const AreaChart = dynamic(import('components/area-chart'), { ssr: false });

const TokensPage: React.FC<TokensPageProps> = ({
  data: { chartData, daoTokens, totalValue, receipts, dao },
}) => {
  const router = useRouter();
  const daoId = router.query.dao as string;
  const nearPrice = useNearPrice();
  const { accountId, login } = useAuthContext();
  const TRANSACTIONS_PER_PAGE = 10;

  const [showCreateProposal, setShowCreateProposal] = useState(false);

  const handleClick = useCallback(
    () => (accountId ? setShowCreateProposal(true) : login()),
    [login, accountId]
  );

  const handleCreateProposal = useCallback(() => {
    setShowCreateProposal(true);
  }, []);

  const captions = useMemo(
    () => [
      {
        label: 'Total Value Locked',
        value: formatCurrency(parseFloat(totalValue) * nearPrice),
        currency: 'USD',
      },
    ],
    [nearPrice, totalValue]
  );

  // TODO - existing receipts endpoint doesn't support pagination yet
  const pageCount = Math.round(receipts.length / TRANSACTIONS_PER_PAGE);
  const [activePage, setActivePage] = useState(0);
  const [sortAsc, setSortAsc] = useState(false);
  const filterClickHandler = useCallback(() => {
    setSortAsc(!sortAsc);
  }, [sortAsc]);
  const pageChangeHandler = useCallback(({ selected }) => {
    setActivePage(selected);
  }, []);

  const refreshData = useCallback(() => {
    router.replace(router.asPath);
  }, [router]);

  return (
    <div className={styles.root}>
      <div className={styles.breadcrumb}>
        <Link passHref href="/all/daos">
          <a href="*" className={styles.link}>
            <span className={styles.daoName}>All DAOs</span>
          </a>
        </Link>
        <span>
          <Icon name="buttonArrowRight" width={16} />
        </span>
        <Link passHref href={`/dao/${daoId}`}>
          <a href="*" className={styles.link}>
            <span className={styles.daoName}>
              {dao?.displayName || dao?.id}
            </span>
          </a>
        </Link>
        <span>
          <Icon name="buttonArrowRight" width={16} />
        </span>
        <span className={styles.activeLink}>Treasury</span>
      </div>
      <div className={styles.dao}>
        {dao && (
          <DaoDetailsMinimized
            dao={dao}
            accountId={accountId}
            onCreateProposalClick={handleCreateProposal}
          />
        )}
        {showCreateProposal && dao && (
          <div className={styles.newProposalWrapper}>
            <CreateProposal
              dao={dao}
              proposalVariant={ProposalVariant.ProposeTransfer}
              onCreate={isSuccess => {
                if (isSuccess) {
                  refreshData();
                  setShowCreateProposal(false);
                }
              }}
              onClose={() => {
                setShowCreateProposal(false);
              }}
            />
          </div>
        )}
      </div>
      <div className={styles.header}>
        <h1>Tokens</h1>
        <Button variant="black" size="small" onClick={handleClick}>
          Propose Payout
        </Button>
      </div>
      <div className={styles.account}>
        <div className={styles.caption}>DAO account name</div>
        <div className={styles.name}>
          <DaoAddressLink daoAddress={daoId} />
          <CopyButton text={daoId} className={styles.icon} />
        </div>
      </div>
      <div className={styles.total}>
        <ChartCaption captions={captions} />
      </div>
      <div className={styles.chart}>
        <AreaChart data={chartData} />
      </div>
      <div className={styles.tokens}>
        {daoTokens.map(({ tokenId, icon, symbol, balance }) => (
          <TokenCard
            key={`${tokenId}-${symbol}`}
            symbol={symbol}
            icon={symbol === 'NEAR' ? 'NEAR' : icon}
            balance={Number(balance)}
            totalValue={
              symbol === TokenDeprecated.NEAR && balance
                ? formatCurrency(parseFloat(balance) * nearPrice)
                : null
            }
          />
        ))}
      </div>
      <div className={styles.label}>Transactions</div>
      <Button
        variant="tertiary"
        className={styles.filter}
        onClick={filterClickHandler}
      >
        {sortAsc ? 'Less recent' : 'Most recent'}
        <Icon
          name="buttonArrowUp"
          className={classNames(styles.filterIcon, {
            [styles.rotate]: sortAsc,
          })}
        />
      </Button>
      <div className={styles.transactions}>
        {receipts
          .sort((a, b) =>
            sortAsc ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
          )
          .slice(
            activePage * TRANSACTIONS_PER_PAGE,
            (activePage + 1) * TRANSACTIONS_PER_PAGE
          )
          .map(
            ({
              type,
              timestamp,
              deposit,
              date,
              predecessorAccountId,
              receiptId,
              txHash,
            }) => (
              <div
                className={styles.row}
                key={`${type}_${timestamp}_${deposit}_${receiptId}`}
              >
                <TransactionCard
                  tokenName={TokenDeprecated.NEAR}
                  type={type}
                  deposit={deposit}
                  date={date}
                  txHash={txHash}
                  accountName={predecessorAccountId}
                />
              </div>
            )
          )}
      </div>
      {pageCount > 0 ? (
        <div className={styles.pagination}>
          <Pagination
            pageCount={pageCount}
            onPageActive={pageChangeHandler}
            onPageChange={pageChangeHandler}
          />
        </div>
      ) : null}
    </div>
  );
};

export default TokensPage;
