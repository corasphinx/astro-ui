/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect, Contract, keyStores, Near } from 'near-api-js';
import { NearConfig, nearConfig } from 'config';
import Decimal from 'decimal.js';
import omit from 'lodash/omit';

import { CreateTokenParams } from 'types/token';

import { DAO } from 'types/dao';
import { CreateProposalParams, DaoConfig, Proposal } from 'types/proposal';
import { SearchResultsData } from 'types/search';
import {
  mapDaoDTOListToDaoList,
  DaoDTO,
  mapDaoDTOtoDao,
  GetDAOsResponse
} from 'services/SputnikService/mappers/dao';
import {
  GetProposalsResponse,
  mapProposalDTOToProposal,
  ProposalDTO
} from 'services/SputnikService/mappers/proposal';
import {
  mapSearchResultsDTOToDataObject,
  SearchResponse
} from 'services/SputnikService/mappers/search-results';

import { HttpService, httpService } from 'services/HttpService';
import Big from 'big.js';
import PromisePool from '@supercharge/promise-pool';
import { BountiesResponse, BountyResponse } from 'types/bounties';
import { ContractPool } from './ContractPool';
import { yoktoNear, gas } from './constants';
import { SputnikWalletConnection } from './SputnikWalletConnection';

class SputnikService {
  private readonly config: NearConfig;

  private readonly httpService: HttpService = httpService;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private factoryContract!: Contract & any;

  private factoryTokenContract!: Contract & any;

  private walletConnection!: SputnikWalletConnection;

  private near!: Near;

  private contractPool!: ContractPool;

  constructor(config: NearConfig) {
    this.config = config;
  }

  public async init(): Promise<void> {
    this.near = await connect({
      deps: {
        keyStore: new keyStores.BrowserLocalStorageKeyStore()
      },
      ...this.config
    });

    this.walletConnection = new SputnikWalletConnection(this.near, 'sputnik');

    const account = this.walletConnection.account();

    this.factoryContract = new Contract(account, this.config.contractName, {
      viewMethods: ['get_dao_list'],
      changeMethods: ['create']
    });

    this.factoryTokenContract = new Contract(
      account,
      this.config.tokenContractName,
      {
        viewMethods: [
          'get_required_deposit',
          'get_number_of_tokens',
          'get_tokens',
          'get_token'
        ],
        changeMethods: ['create_token', 'storage_deposit']
      }
    );

    this.contractPool = new ContractPool(account);
  }

  public claimBounty(
    daoId: string,
    args: { bountyId: number; deadline: string; bountyBond: string }
  ) {
    const { bountyId: id, deadline, bountyBond } = args;
    const amount = new Decimal(args.bountyBond);
    const amountYokto = amount.mul(yoktoNear).toFixed();

    this.contractPool
      .get(daoId)
      .bounty_claim({ id, deadline, bountyBond }, gas, amountYokto.toString());
  }

  public unclaimBounty(daoId: string, bountyId: string) {
    this.contractPool.get(daoId).bounty_giveup({ id: bountyId }, gas);
  }

  public isAuthorized(): boolean {
    if (process.browser && this.walletConnection) {
      return this.walletConnection.isSignedIn();
    }

    return true;
  }

  public async login(): Promise<void> {
    await this.walletConnection.requestSignIn(
      this.config.contractName,
      'Sputnik DAO',
      `${window.origin}/callback`,
      `${window.origin}/callback`
    );
    await this.init();
  }

  public async logout(): Promise<void> {
    this.walletConnection.signOut();
  }

  public getAccountId(): string {
    return this.walletConnection.getAccountId();
  }

  async computeRequiredDeposit(args: unknown) {
    return Big(
      await this.factoryTokenContract.get_required_deposit({
        args,
        account_id: this.getAccountId()
      })
    );
  }

  // for testing purpose
  public async listTokens() {
    const tokensCount = await this.factoryTokenContract.get_number_of_tokens();
    const chunkSize = 5;
    const chunkCount =
      (tokensCount - (tokensCount % chunkSize)) / chunkSize + 1;

    const { results, errors } = await PromisePool.withConcurrency(1)
      .for([...Array(chunkCount).keys()])
      .process(async (offset: number) =>
        this.factoryTokenContract.get_tokens({
          from_index: offset * chunkSize,
          limit: chunkSize
        })
      );

    // eslint-disable-next-line no-console
    console.log(results, errors);
  }

  public async createToken(params: CreateTokenParams): Promise<any> {
    const args = {
      owner_id: this.getAccountId(),
      total_supply: '1000000000000000000000',
      metadata: {
        spec: 'ft-1.0.0',
        decimals: 18,
        name: params.name,
        symbol: params.symbol,
        icon: params.icon
      }
    };

    const TGas = Big(10).pow(12);
    const BoatOfGas = Big(200).mul(TGas);
    // const requiredDeposit = await this.computeRequiredDeposit(args);
    //
    // await this.factoryTokenContract.storage_deposit(
    //   {},
    //   BoatOfGas.toFixed(0),
    //   requiredDeposit.toFixed(0)
    // );

    await this.factoryTokenContract.create_token(
      { args },
      BoatOfGas.toFixed(0)
    );
  }

  public async createDao(params: any): Promise<boolean> {
    const config: DaoConfig = {
      name: params.name,
      purpose: params.purpose,
      metadata: ''
    };

    // TODO what should be in metadata?
    const argsList = {
      purpose: params.purpose,
      council: params.council.split('\n').filter((item: string) => item),
      bond: new Decimal(params.bond).mul(yoktoNear).toFixed(),
      vote_period: new Decimal(params.votePeriod).mul('3.6e12').toFixed(),
      grace_period: new Decimal(params.gracePeriod).mul('3.6e12').toFixed(),
      policy: [this.getAccountId()],
      config
    };

    const amount = new Decimal(params.amountToTransfer);
    const amountYokto = amount.mul(yoktoNear).toFixed();
    const args = Buffer.from(JSON.stringify(argsList)).toString('base64');

    try {
      return await this.factoryContract.create(
        {
          name: params.name,
          args
        },
        gas,
        amountYokto.toString()
      );
    } catch (err) {
      if (err.message !== 'Failed to redirect to sign transaction') {
        throw err;
      }
    }

    return false;
  }

  // SputnikService.createProposal({
  //   daoId: 'alexeydao.sputnikv2.testnet',
  //   description: 'description',
  //   kind: 'AddMemberToRole',
  //   data: {
  //     member_id: 'somenear.testnet',
  //     role: 'council'
  //   },
  //   bond: '1000000000000000000000000'
  // });
  // TODO check data structures for different proposals
  public async createProposal(params: CreateProposalParams): Promise<any> {
    const { daoId, description, kind, data, bond } = params;

    const kindData = data
      ? {
          [kind]: data
        }
      : kind;

    return this.contractPool.get(daoId).add_proposal(
      {
        proposal: {
          description,
          kind: kindData
        }
      },
      new Decimal('30000000000000').toString(),
      bond
    );
  }

  public async getDaoList(params?: {
    offset?: number;
    limit?: number;
    sort?: string;
  }): Promise<DAO[]> {
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 50;
    const sort = params?.sort ?? 'createdAt,DESC';

    const { data } = await this.httpService.get<GetDAOsResponse>('/daos', {
      params: {
        offset,
        limit,
        sort
      }
    });

    return mapDaoDTOListToDaoList(data.data);
  }

  public async getDaoById(daoId: string): Promise<DAO | null> {
    try {
      const { data: dao } = await this.httpService.get<DaoDTO>(
        `/daos/${daoId}`
      );

      return mapDaoDTOtoDao(dao);
    } catch (error) {
      if ([400, 404].includes(error.response.status)) {
        return null;
      }

      throw error;
    }
  }

  public async search(params: {
    offset?: number;
    limit?: number;
    sort?: string;
    query: string;
  }): Promise<SearchResultsData | null> {
    // const offset = params?.offset ?? 0;
    // const limit = params?.limit ?? 50;

    const result = await this.httpService.get<SearchResponse>('/search', {
      params: {
        query: params.query
      }
    });

    return mapSearchResultsDTOToDataObject(params.query, {
      daos: (result.data as SearchResponse).daos as DaoDTO[],
      proposals: (result.data as SearchResponse).proposals as ProposalDTO[],
      members: []
    });
  }

  public async getProposals(
    daoId?: string,
    offset = 0,
    limit = 50
  ): Promise<Proposal[]> {
    const params = {
      filter: `daoId||$eq||${daoId}`,
      offset,
      limit
    };

    const { data: proposals } = await this.httpService.get<
      GetProposalsResponse
    >('/proposals', {
      params: daoId ? params : omit(params, 'filter')
    });

    return proposals.data.map(mapProposalDTOToProposal);
  }

  public async getPolls(
    daoId: string,
    offset = 0,
    limit = 50
  ): Promise<Proposal[]> {
    const { data: proposals } = await this.httpService.get<
      GetProposalsResponse
    >('/proposals', {
      params: {
        filter: `daoId||$eq||${daoId}`,
        offset,
        limit
      }
    });

    return proposals.data
      .filter(item => item.kind.type === 'Vote')
      .map(mapProposalDTOToProposal);
  }

  public async getProposal(
    contractId: string,
    index: number
  ): Promise<Proposal | null> {
    try {
      const { data: proposal } = await this.httpService.get<ProposalDTO>(
        `/proposals/${contractId}-${index}`
      );

      return mapProposalDTOToProposal(proposal);
    } catch (error) {
      if ([400, 404].includes(error.response.status)) {
        return null;
      }

      throw error;
    }
  }

  public async getBountiesByDaoId(
    daoId: string,
    params?: {
      offset?: number;
      limit?: number;
      sort?: string;
    }
  ): Promise<BountyResponse[]> {
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 50;
    const sort = params?.sort ?? 'createdAt,DESC';

    const { data } = await this.httpService.get<BountiesResponse>('/bounties', {
      params: {
        filter: `daoId||$eq||${daoId}`,
        offset,
        limit,
        sort
      }
    });

    return data.data;
  }

  public vote(
    daoId: string,
    proposalId: number,
    action: 'VoteApprove' | 'VoteRemove' | 'VoteReject'
  ): Promise<void> {
    return this.contractPool.get(daoId).act_proposal({
      id: proposalId,
      action
    });
  }

  public finalize(contractId: string, proposalId: number): Promise<void> {
    return this.contractPool.get(contractId).finalize({
      id: proposalId
    });
  }
}

const nearService = new SputnikService(nearConfig);

export default nearService;
