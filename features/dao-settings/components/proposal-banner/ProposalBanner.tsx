import { Button } from 'components/button/Button';
import { Input } from 'components/input/Input';
import { TextArea } from 'components/textarea/TextArea';
import { VoteDetails } from 'components/vote-details';
import { ExpandableDetails } from 'features/bounty/dialogs/expandable-details';
import { Scope } from 'features/vote-policy/helpers';
import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import styles from './dao-setting-banner-form.module.scss';

export interface ProposalBannerProps {
  onCancel: () => void;
  onEdit: () => void;
  onSubmit?: () => void;
  title?: string;
  disable?: boolean;
  disableTooltip?: string;
  form?: string;
  viewMode: boolean;
  toggleViewMode?: (state?: boolean) => void;
  scope?: Scope;
}

export const ProposalBanner: FC<ProposalBannerProps> = ({
  title,
  onEdit,
  onSubmit,
  onCancel,
  viewMode,
  form,
  disable,
  disableTooltip,
  scope
}) => {
  const { register } = useFormContext<{
    externalUrl?: string;
    details?: string;
  }>();

  if (viewMode) {
    return (
      <div className={styles.header}>
        {title && <h2>{title}</h2>}
        <Button onClick={onEdit} size="small" variant="secondary">
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.name}>You are making changes to DAO settings</div>
      <div className={styles.control}>
        <Button onClick={onCancel} variant="secondary" size="small">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={disable}
          title={disable ? disableTooltip : undefined}
          form={form}
          onClick={onSubmit}
          variant="primary"
          size="small"
        >
          Propose
        </Button>
      </div>
      {scope && (
        <>
          <div className={styles.desc}>
            <ExpandableDetails
              label="Add description and links"
              className={styles.wrapper}
            >
              <div className={styles.content}>
                <TextArea
                  {...register('details')}
                  label="Details"
                  size="large"
                  textAlign="left"
                  resize="none"
                  maxLength={500}
                />
                <Input
                  {...register('externalUrl')}
                  label="External link"
                  size="large"
                  placeholder="add link"
                  textAlign="left"
                />
              </div>
            </ExpandableDetails>
          </div>
          <div className={styles.details}>
            <ExpandableDetails label="Vote details" className={styles.wrapper}>
              <VoteDetails className={styles.expanded} scope={scope} />
            </ExpandableDetails>
          </div>
        </>
      )}
    </div>
  );
};