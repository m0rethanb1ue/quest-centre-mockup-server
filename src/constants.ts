export enum PERMISSION {
  MasterAdmin = 'master-admin',
  Admin = 'admin',
  Creator = 'creator',
}

export enum STATUS {
  Pending = 'pending',
  Rejected = 'rejected',
  Paused = 'paused',
  Draft = 'draft',
  Approved = 'approved',
  InternalPublish = 'internal_publish',
  ExternalPublish = 'external_publish',
}

export enum FREQUENCY {
  Daily = 'daily',
  Weekly = 'weekly',
  Once = 'once',
}

export enum REWARD_TYPE {
  InGameItem = 'in_game_item',
  InGameToken = 'in_game_token',
  OnChainToken = 'on_chain_token',
}

export enum DISTRIBUTION_TYPE {
  Instant = 'instant',
  Scheduled = 'scheduled',
}

export enum REWARD_CLAIM_STATUS {
  Claimed = 'claimed',
  Unclaimed = 'unclaimed',
  Forbidden = 'forbidden',
}

export enum ACTION_TYPE {
  Login = 'login',
  CheckIn = 'check_in',
  BuyItem = 'buy_item',
}

export enum SECTION_TYPE {
  Action = 'action',
  Condition = 'condition',
}

export enum ActivityTypeDeprecated {
  Action = 'action',
  Condition = 'condition',
}
