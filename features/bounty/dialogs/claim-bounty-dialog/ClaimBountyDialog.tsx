import { Bounty } from 'components/cards/bounty-card/types';
import { Modal } from 'components/modal';

import styles from 'features/bounty/dialogs/bounty-dialogs.module.scss';
import { formatYoktoValue } from 'helpers/format';
import { useDao } from 'hooks/useDao';
import { useRouter } from 'next/router';
import React, { FC, useCallback } from 'react';
import { SputnikService } from 'services/SputnikService';
import ClaimBountyContent from './components/ClaimBountyContent';

export interface ClaimBountyDialogProps {
  isOpen: boolean;
  onClose: (...args: unknown[]) => void;
  data: Bounty;
}

export const ClaimBountyDialog: FC<ClaimBountyDialogProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const router = useRouter();
  const daoId = router.query.dao as string;
  const currentDao = useDao(daoId);

  const handleSubmit = useCallback(() => {
    if (!currentDao) return;

    SputnikService.claimBounty(currentDao.id, {
      bountyId: Number(data.id),
      deadline: data.deadlineThreshold,
      bountyBond: formatYoktoValue(currentDao.policy.bountyBond)
    });
    onClose('submitted');
  }, [data.deadlineThreshold, data.id, onClose, currentDao]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <header className={styles.header}>
        <h2>Claim bounty</h2>
      </header>
      <ClaimBountyContent
        onClose={onClose}
        onSubmit={handleSubmit}
        data={data}
      />
    </Modal>
  );
};
