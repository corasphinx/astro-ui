import uniqBy from 'lodash/uniqBy';
import {
  ProposalComment,
  ReportCommentsInput,
  SendCommentsInput,
} from 'types/proposal';
import { useEffect, useState } from 'react';
import { SputnikHttpService, SputnikNearService } from 'services/sputnik';
import { NOTIFICATION_TYPES, showNotification } from 'features/notifications';
import { useAsyncFn, useMountedState } from 'react-use';
import { useSocket } from 'context/SocketContext';
import { useAuthContext } from 'context/AuthContext';
import { useTranslation } from 'next-i18next';

export function useProposalComments(
  proposalId: string
): {
  comments: ProposalComment[] | null;
  loading: boolean;
  sendComment: (params: SendCommentsInput) => void;
  reportComment: (params: ReportCommentsInput) => void;
  deleteComment: (commentId: number, reason: string) => void;
} {
  const { accountId } = useAuthContext();
  const { t } = useTranslation();
  const { socket } = useSocket();
  const isMounted = useMountedState();
  const [comments, setComments] = useState<ProposalComment[] | null>(null);

  const [{ loading }, getComments] = useAsyncFn(async () => {
    try {
      const data = await SputnikHttpService.getProposalComments(proposalId);

      if (isMounted()) {
        setComments(data);
      }
    } catch (err) {
      showNotification({
        type: NOTIFICATION_TYPES.ERROR,
        lifetime: 20000,
        description: err.message,
      });
    }
  }, [proposalId]);

  const [{ loading: uploading }, sendComment] = useAsyncFn(
    async params => {
      try {
        const publicKey = await SputnikNearService.getPublicKey();
        const signature = await SputnikNearService.getSignature();

        if (publicKey && signature && accountId) {
          await SputnikHttpService.sendProposalComment({
            ...params,
            accountId,
            publicKey,
            signature,
          });
        }
      } catch (err) {
        let { message } = err;

        if (err.response.status === 429) {
          message = t('commentsSpamProtection');
        }

        showNotification({
          type: NOTIFICATION_TYPES.ERROR,
          lifetime: 20000,
          description: message,
        });
      }
    },
    [proposalId]
  );

  const [, reportComment] = useAsyncFn(
    async params => {
      try {
        const publicKey = await SputnikNearService.getPublicKey();
        const signature = await SputnikNearService.getSignature();

        if (publicKey && signature && accountId) {
          await SputnikHttpService.reportProposalComment({
            ...params,
            accountId,
            publicKey,
            signature,
          });
          await getComments();
        }
      } catch (err) {
        showNotification({
          type: NOTIFICATION_TYPES.ERROR,
          lifetime: 20000,
          description: err.message,
        });
      }
    },
    [proposalId]
  );

  const [, deleteComment] = useAsyncFn(
    async (commentId, reason) => {
      try {
        const publicKey = await SputnikNearService.getPublicKey();
        const signature = await SputnikNearService.getSignature();

        if (publicKey && signature && accountId) {
          await SputnikHttpService.deleteProposalComment(commentId, {
            accountId,
            publicKey,
            signature,
            reason,
          });
        }
      } catch (err) {
        showNotification({
          type: NOTIFICATION_TYPES.ERROR,
          lifetime: 20000,
          description: err.message,
        });
      }
    },
    [proposalId]
  );

  useEffect(() => {
    if (socket) {
      socket.on('comment', (newComment: ProposalComment) => {
        if (newComment.proposalId === proposalId) {
          if (isMounted()) {
            setComments(prev => {
              if (prev) {
                return uniqBy([...prev, newComment], val => val.id);
              }

              return [newComment];
            });
          }
        }
      });

      socket.on('comment-removed', (removedComment: ProposalComment) => {
        if (removedComment.proposalId === proposalId) {
          if (isMounted()) {
            setComments(prev => {
              if (prev) {
                return prev.filter(item => item.id !== removedComment.id);
              }

              return [];
            });
          }
        }
      });
    }

    getComments();
  }, [getComments, isMounted, proposalId, socket]);

  return {
    comments,
    loading: loading || uploading,
    sendComment,
    reportComment,
    deleteComment,
  };
}