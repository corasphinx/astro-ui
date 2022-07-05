import { useAsync, useAsyncFn } from 'react-use';
import { useWalletContext } from 'context/WalletContext';
import { SputnikHttpService } from 'services/sputnik';
import { useRouter } from 'next/router';
import { DAO, DaoDelegation } from 'types/dao';
import { formatYoktoValue } from 'utils/format';
import { useCallback, useEffect, useState } from 'react';
import {
  CustomContract,
  DelegateTokenDetails,
  UserDelegateDetails,
} from 'astro_2.0/features/pages/nestedDaoPagesContent/DelegatePageContent/types';

export function useDelegatePageData(
  dao: DAO
): {
  loadingTotalSupply: boolean;
  totalSupply: string | undefined;
  tokenDetails:
    | (DelegateTokenDetails & { contractAddress: string })
    | undefined;
  loadingDelegateByUser: boolean;
  delegateByUser: (UserDelegateDetails & { nextActionTime: Date }) | undefined;
  handleSearch: (val: string) => Promise<void>;
  handleReset: () => void;
  data: DaoDelegation[];
} {
  const router = useRouter();
  const { nearService, accountId } = useWalletContext();

  const daoId = router.query.dao as string;
  const ts = router.query.ts as string;

  const [data, setData] = useState<DaoDelegation[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const { value: tokenDetails } = useAsync(async () => {
    if (!nearService) {
      return undefined;
    }

    const settings = await SputnikHttpService.getDaoSettings(daoId);

    const contractAddress = settings?.createGovernanceToken?.contractAddress;

    if (!contractAddress) {
      return undefined;
    }

    const contract = nearService.getContract(contractAddress, [
      'ft_balance_of',
      'ft_metadata',
    ]) as CustomContract;

    const [meta, balance] = await Promise.all([
      contract.ft_metadata(),
      contract.ft_balance_of({ account_id: accountId }),
    ]);

    return {
      balance: Number(formatYoktoValue(balance, meta.decimals)),
      symbol: meta.symbol,
      decimals: meta.decimals,
      contractAddress,
    };
  }, [nearService, ts]);

  const {
    loading: loadingTotalSupply,
    value: totalSupply,
  } = useAsync(async () => {
    if (!nearService) {
      return undefined;
    }

    const contract = nearService.getContract(daoId, [
      'delegation_total_supply',
    ]) as CustomContract;

    return contract.delegation_total_supply();
  }, [daoId, nearService, ts]);

  const {
    loading: loadingDelegateByUser,
    value: delegateByUser,
  } = useAsync(async () => {
    if (!nearService) {
      return undefined;
    }

    const stackingContract = nearService.getStackingContract(dao.name);

    if (!stackingContract) {
      return undefined;
    }

    const contract = nearService.getContract(stackingContract, [
      'ft_balance_of',
      'ft_metadata',
      'get_user',
    ]) as CustomContract;

    const userData = await contract.get_user({ account_id: accountId });

    if (!userData) {
      return undefined;
    }

    const delegatedTotal = userData.delegated_amounts.reduce((res, item) => {
      const [, balance] = item;

      return res + +balance;
    }, 0);

    return {
      accountId,
      delegatedBalance: delegatedTotal,
      stakedBalance: userData.vote_amount,
      nextActionTime: new Date(
        Number(userData.next_action_timestamp) / 1000000
      ),
    };
  }, [dao, nearService, accountId, ts]);

  const [, fetchData] = useAsyncFn(async () => {
    const res = await SputnikHttpService.getDelegations(daoId);

    setData(res);
  }, [daoId, ts]);

  const handleSearch = useCallback(async searchInput => {
    setSearchFilter(searchInput);
  }, []);

  const handleReset = useCallback(() => {
    setSearchFilter('');
  }, []);

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, [fetchData]);

  const filteredData = data.filter(item =>
    item.accountId.startsWith(searchFilter)
  );

  return {
    loadingTotalSupply,
    totalSupply,
    tokenDetails,
    loadingDelegateByUser,
    delegateByUser,
    handleSearch,
    handleReset,
    data: filteredData,
  };
}

export function useVotingThreshold(dao: DAO): string {
  const holdersRole = dao.policy.roles.find(
    role => role.kind === 'Member' && role.name === 'TokenHolders'
  );

  if (!holdersRole) {
    return '0';
  }

  return holdersRole.votePolicy.vote.weight ?? '0';
}

export function useTriggerUpdate(): {
  triggerUpdate: () => Promise<void>;
} {
  const router = useRouter();

  const triggerUpdate = useCallback(async () => {
    await router.replace(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          ts: new Date().getTime(),
        },
      },
      undefined,
      {
        scroll: true,
        shallow: true,
      }
    );
  }, [router]);

  return {
    triggerUpdate,
  };
}