import { CancelToken } from 'axios';
import {
  AddBountyRequest,
  FunctionCallAction,
  ProposalComment,
  ProposalType,
} from 'types/proposal';
import { DraftProposalFeedItem } from 'types/draftProposal';
import { SearchResultsData } from 'types/search';

export type BaseParams = {
  id?: string;
  offset?: number;
  limit?: number;
  sort?: string;
  filter?: string;
  createdBy?: string;
  query?: string;
};

export type SearchParams = {
  query: string;
  cancelToken?: CancelToken;
  accountId?: string;
  size?: number;
  field?: string;
  index?: string;
} & BaseParams;

export enum SearchResponseIndex {
  DAO = 'dao',
  PROPOSAL = 'proposal',
  COMMENT = 'comment',
  DRAFT_PROPOSAL = 'draftproposal',
  BOUNTY = 'bounty',
}

export interface DaoIndex {
  accountIds: string[];
  accounts: string;
  activeProposalCount: number;
  amount: string;
  config: { name: string; purpose: string; metadata: string };
  council: string[];
  councilSeats: number;
  createTimestamp: string;
  createdBy: string;
  daoVersionHash: string;
  delegations: unknown[];
  description: string;
  id: string;
  lastBountyId: number;
  lastProposalId: number;
  link: string;
  metadata: string;
  name: string;
  numberOfAssociates: number;
  numberOfGroups: number;
  numberOfMembers: number;
  stakingContract: string;
  status: 'Inactive';
  totalDaoFunds: number;
  totalProposalCount: number;
  totalSupply: string;
  transactionHash: string;
  policy: string;
}

export interface ProposalIndex {
  accounts: string;
  amount: string;
  bountyClaimId: null;
  bountyDoneId: null;
  commentsCount: number;
  createTimestamp: string;
  dao: DaoIndex;
  daoId: string;
  description: string;
  failure: null;
  id: string;
  msg: string;
  name: string;
  policyLabel: string;
  proposalId: number;
  proposer: string;
  receiverId: string;
  status: 'Approved' | 'Expired';
  submissionTime: string;
  tokenId: string;
  transactionHash: string;
  type: ProposalType;
  votePeriodEnd: string;
  voteStatus: 'Active';
  votes: string;

  // type specifics
  bounty: AddBountyRequest;
  policy: string;
  config: { metadata: string; name: string; purpose: string };
  memberId: string;
  role: string;
  actions: FunctionCallAction[];
  stakingId: string;
  hash: string;
  methodName: string;
  bountyId: string;
  completeDate: string;
}

export interface BountyIndex {
  accounts: string;
  amount: string;
  bountyClaims: string;
  bountyDoneProposals: string;
  bountyId: number;
  commentsCount: number;
  createTimestamp: string;
  daoId: string;
  description: string;
  id: string;
  maxDeadline: string;
  name: string;
  numberOfClaims: number;
  proposal: ProposalIndex;
  proposalId: string;
  times: string;
  token: string;
  transactionHash: string;
}

/* eslint-disable camelcase */
export type OpenSearchResponse = {
  hits: {
    hits: {
      _id: string;
      _index: SearchResponseIndex;
      _score: null;
      _type: '_doc';
      sort: string[];
      _source:
        | DaoIndex
        | ProposalComment
        | ProposalIndex
        | DraftProposalFeedItem
        | BountyIndex;
    }[];
    max_score: null;
    total: {
      value: number;
      relation: 'eq';
    };
  };
  timed_out: boolean;
  took: number;
  _shards: {
    failed: number;
    skipped: number;
    successful: number;
    total: number;
  };
};

export type SearchResult = {
  total: number;
  data:
    | SearchResultsData['daos']
    | SearchResultsData['proposals']
    | SearchResultsData['drafts']
    | SearchResultsData['comments']
    | SearchResultsData['bounties'];
};

export interface OpenSearchQuery {
  bool?: {
    must?: {
      simple_query_string: {
        query: string | number;
        fields: string[];
      };
    }[];
    must_not?: {
      simple_query_string: {
        query: string | number;
        fields: string[];
      };
    }[];
  };
  match_all?: Record<string, string>;
}
