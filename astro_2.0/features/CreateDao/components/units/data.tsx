import {
  DAOProposalsType,
  DaoSettingOption,
  DAOStructureType,
  DAOTemplate,
  DAOVotingPowerType,
  DaoSubjectInfo,
} from 'astro_2.0/features/CreateDao/components/units/types';

const DAO_PROPOSALS_OPEN: DaoSettingOption<DAOProposalsType> = {
  value: 'open',
  icon: 'illustrationOpenOrganization',
  subject: 'proposals',
  title: 'All',
  description: 'Anyone with a NEAR wallet.',
};

const DAO_PROPOSALS_CLOSED: DaoSettingOption<DAOProposalsType> = {
  value: 'closed',
  icon: 'illustrationMembersOnly',
  subject: 'proposals',
  title: 'Members',
  description: 'Only members of your DAO',
};

const DAO_VOTING_POWER_DEMOCRATIC: DaoSettingOption<DAOVotingPowerType> = {
  value: 'democratic',
  icon: 'illustrationVotePerMember',
  subject: 'voting',
  title: 'Democratic',
  description: 'Every member gets 1 vote.',
};

const DAO_VOTING_POWER_TOKEN: DaoSettingOption<DAOVotingPowerType> = {
  value: 'weighted',
  icon: 'illustrationTokenWeighted',
  subject: 'voting',
  title: 'Token weighted',
  description: 'More tokens more voting power!',
};

const DAO_STRUCTURE_FLAT: DaoSettingOption<DAOStructureType> = {
  value: 'flat',
  icon: 'illustrationFlatOrganization',
  subject: 'structure',
  title: 'Flat',
  description: 'No groups; all members have equal access.',
};

const DAO_STRUCTURE_GROUPS: DaoSettingOption<DAOStructureType> = {
  value: 'groups',
  icon: 'illustrationGroupsAndCommitttees',
  subject: 'structure',
  title: 'Groups and Committees',
  description: 'Specific groups can vote on specific proposals.',
};

const DAO_TEMPLATE_CLUB: DAOTemplate = {
  variant: 'club',
  title: 'Club',
  description: `A small circle of friends
A group of fans
A social club`,
  proposals: 'closed',
  structure: 'flat',
  voting: 'democratic',
};

const DAO_TEMPLATE_FOUNDATION: DAOTemplate = {
  variant: 'foundation',
  title: 'Foundation',
  description: `A group giving donations
An organization funding community projects
A fund for open-source projects`,
  proposals: 'open',
  structure: 'groups',
  voting: 'democratic',
};

const DAO_TEMPLATE_CORP: DAOTemplate = {
  variant: 'corporation',
  title: 'Corporation',
  description: `A business with shareholders
A startup or company`,
  proposals: 'closed',
  structure: 'groups',
  voting: 'weighted',
};

const DAO_TEMPLATE_COOP: DAOTemplate = {
  variant: 'cooperative',
  title: 'Cooperative',
  description: `A business with members
A creative collective`,
  proposals: 'closed',
  structure: 'groups',
  voting: 'democratic',
};

export const DAO_TEMPLATES: DAOTemplate[] = [
  DAO_TEMPLATE_CLUB,
  DAO_TEMPLATE_FOUNDATION,
  DAO_TEMPLATE_CORP,
  DAO_TEMPLATE_COOP,
];

export const DAO_PROPOSALS_OPTIONS: Record<
  DAOProposalsType,
  DaoSettingOption<DAOProposalsType>
> = {
  open: DAO_PROPOSALS_OPEN,
  closed: DAO_PROPOSALS_CLOSED,
};

export const DAO_VOTING_POWER_OPTIONS: Record<
  DAOVotingPowerType,
  DaoSettingOption<DAOVotingPowerType>
> = {
  democratic: DAO_VOTING_POWER_DEMOCRATIC,
  weighted: DAO_VOTING_POWER_TOKEN,
};

export const DAO_STRUCTURE_OPTIONS: Record<
  DAOStructureType,
  DaoSettingOption<DAOStructureType>
> = {
  flat: DAO_STRUCTURE_FLAT,
  groups: DAO_STRUCTURE_GROUPS,
};

export const DAO_SUBJECT_OPTIONS = {
  voting: Object.values(DAO_VOTING_POWER_OPTIONS),
  structure: Object.values(DAO_STRUCTURE_OPTIONS),
  proposals: Object.values(DAO_PROPOSALS_OPTIONS),
};

export const DAO_RULES_INFO: DaoSubjectInfo[] = [
  {
    subject: 'proposals',
    title: 'Proposals',
    subTitle: 'Who can submit proposals to your DAO? (submit not = vote)',
  },
  {
    subject: 'voting',
    title: 'Voting Power',
    subTitle:
      'Carefuly pick to not let people who own the token but not part of the DAO overtake you!',
  },
  {
    subject: 'structure',
    title: 'Structure',
    subTitle: 'Select level of access to vote on proposals.',
  },
];
