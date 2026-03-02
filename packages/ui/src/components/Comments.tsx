/**
 * Comment System Component
 * Threaded comments with reactions, replies, and moderation
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { formatRelativeTime } from './utils';
import { useLocale } from 'next-intl';

// ================================
// GraphQL Queries & Mutations
// ================================
const GET_COMMENTS = gql`
  query GetComments($articleId: ID!, $limit: Int, $offset: Int) {
    comments(articleId: $articleId, limit: $limit, offset: $offset) {
      edges {
        node {
          id
          content
          user {
            id
            name
            avatarUrl
            role
          }
          parentId
          replies {
            id
            content
            user {
              id
              name
              avatarUrl
            }
            createdAt
          }
          isApproved
          createdAt
          updatedAt
        }
      }
      totalCount
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
      id
      content
      user {
        id
        name
        avatarUrl
      }
      createdAt
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) {
      success
    }
  }
`;

const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      content
      updatedAt
    }
  }
`;

// ================================
// Styled Components
// ================================
const CommentsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CommentsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const CommentsTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
`;

const CommentsCount = styled.span`
  font-size: 16px;
  color: #666;
`;

const CommentForm = styled.form`
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 32px;
  border: 2px solid transparent;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #667eea;
  }
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 12px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #999;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CharCount = styled.div<{ $warning?: boolean }>`
  font-size: 13px;
  color: ${props => props.$warning ? '#f44336' : '#999'};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary'; $size?: 'sm' | 'md' }>`
  padding: ${props => props.$size === 'sm' ? '8px 16px' : '12px 24px'};
  border: none;
  border-radius: 8px;
  font-size: ${props => props.$size === 'sm' ? '13px' : '15px'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: white;
    color: #666;
    border: 1px solid #e0e0e0;
    
    &:hover:not(:disabled) {
      background: #f8f9fa;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CommentItem = styled.div<{ $isReply?: boolean }>`
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  margin-left: ${props => props.$isReply ? '48px' : '0'};
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 640px) {
    margin-left: ${props => props.$isReply ? '24px' : '0'};
    padding: 16px;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: start;
  gap: 12px;
  margin-bottom: 12px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const CommentMeta = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Badge = styled.span<{ $color: string }>`
  padding: 2px 8px;
  background: ${props => props.$color};
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
`;

const CommentTime = styled.div`
  font-size: 13px;
  color: #999;
  margin-top: 2px;
`;

const CommentContent = styled.div`
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: #666;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: #667eea;
  }
`;

const ReplyForm = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
`;

const EditForm = styled.div`
  margin-top: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  color: #666;

  svg {
    width: 80px;
    height: 80px;
    margin: 0 auto 16px;
    opacity: 0.3;
  }

  h3 {
    font-size: 20px;
    margin: 0 0 8px 0;
    color: #1a1a1a;
  }

  p {
    margin: 0;
  }
`;

const LoginPrompt = styled.div`
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 32px;

  p {
    margin: 0 0 16px 0;
    color: #666;
  }

  a {
    color: #667eea;
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }
`;

// ================================
// Comment Component
// ================================
interface CommentProps {
  comment: any;
  onReply: (commentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  currentUserId?: string;
}

function Comment({ comment, onReply, onEdit, onDelete, currentUserId }: CommentProps) {
  const locale = useLocale();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);

  const isAuthor = currentUserId === comment.user.id;

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <CommentItem>
      <CommentHeader>
        <Avatar 
          src={comment.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}`}
          alt={comment.user.name}
        />
        <CommentMeta>
          <AuthorName>
            {comment.user.name}
            {comment.user.role === 'ADMIN' && (
              <Badge $color="#667eea">Admin</Badge>
            )}
            {comment.user.role === 'AUTHOR' && (
              <Badge $color="#4caf50">Author</Badge>
            )}
          </AuthorName>
          <CommentTime>
            {formatRelativeTime(comment.createdAt, locale)}
            {comment.updatedAt !== comment.createdAt && ' (edited)'}
          </CommentTime>
        </CommentMeta>
      </CommentHeader>

      {isEditing ? (
        <EditForm>
          <CommentTextarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
          />
          <FormActions>
            <Button $variant="secondary" $size="sm" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button $variant="primary" $size="sm" onClick={handleEdit}>
              Save
            </Button>
          </FormActions>
        </EditForm>
      ) : (
        <>
          <CommentContent>{comment.content}</CommentContent>

          <CommentActions>
            <ActionButton onClick={() => setIsReplying(!isReplying)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply
            </ActionButton>

            {isAuthor && (
              <>
                <ActionButton onClick={() => setIsEditing(true)}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </ActionButton>

                <ActionButton onClick={() => onDelete(comment.id)}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </ActionButton>
              </>
            )}
          </CommentActions>

          {isReplying && (
            <ReplyForm>
              <CommentTextarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={3}
                autoFocus
              />
              <FormActions>
                <Button $variant="secondary" $size="sm" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button $variant="primary" $size="sm" onClick={handleReply}>
                  Reply
                </Button>
              </FormActions>
            </ReplyForm>
          )}
        </>
      )}
    </CommentItem>
  );
}

// ================================
// Comments Section Component
// ================================
interface CommentsProps {
  articleId: string;
}

export default function Comments({ articleId }: CommentsProps) {
  const locale = useLocale();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [commentText, setCommentText] = useState('');
  const MAX_CHARS = 1000;

  const { data, loading, refetch } = useQuery(GET_COMMENTS, {
    variables: { articleId, limit: 50, offset: 0 },
  });

  const [createComment, { loading: creating }] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      toast.success('Comment posted successfully!');
      setCommentText('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to post comment');
    },
  });

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    onCompleted: () => {
      toast.success('Comment deleted');
      refetch();
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });

  const [updateComment] = useMutation(UPDATE_COMMENT, {
    onCompleted: () => {
      toast.success('Comment updated');
      refetch();
    },
    onError: () => {
      toast.error('Failed to update comment');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || commentText.length > MAX_CHARS) return;

    await createComment({
      variables: {
        input: {
          articleId,
          content: commentText,
        },
      },
    });
  };

  const handleReply = async (parentId: string, content: string) => {
    await createComment({
      variables: {
        input: {
          articleId,
          parentId,
          content,
        },
      },
    });
  };

  const handleEdit = async (commentId: string, content: string) => {
    await updateComment({
      variables: { id: commentId, content },
    });
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteComment({
        variables: { id: commentId },
      });
    }
  };

  const comments = data?.comments?.edges?.map(edge => edge.node) || [];
  const totalCount = data?.comments?.totalCount || 0;

  // Organize comments into threads
  const topLevelComments = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  return (
    <CommentsContainer>
      <CommentsHeader>
        <CommentsTitle>Comments</CommentsTitle>
        <CommentsCount>{totalCount} {totalCount === 1 ? 'comment' : 'comments'}</CommentsCount>
      </CommentsHeader>

      {isAuthenticated ? (
        <CommentForm onSubmit={handleSubmit}>
          <CommentTextarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            maxLength={MAX_CHARS}
          />
          <FormActions>
            <CharCount $warning={commentText.length > MAX_CHARS * 0.9}>
              {commentText.length} / {MAX_CHARS}
            </CharCount>
            <Button 
              type="submit" 
              $variant="primary"
              disabled={creating || !commentText.trim() || commentText.length > MAX_CHARS}
            >
              {creating ? 'Posting...' : 'Post Comment'}
            </Button>
          </FormActions>
        </CommentForm>
      ) : (
        <LoginPrompt>
          <p>Please <a href={`/${locale}/login`}>sign in</a> to join the conversation</p>
        </LoginPrompt>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <EmptyState>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3>No comments yet</h3>
          <p>Be the first to share your thoughts!</p>
        </EmptyState>
      ) : (
        <CommentsList>
          {topLevelComments.map(comment => (
            <div key={comment.id}>
              <Comment
                comment={comment}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentUserId={user?.id}
              />
              {replies
                .filter(reply => reply.parentId === comment.id)
                .map(reply => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    currentUserId={user?.id}
                  />
                ))}
            </div>
          ))}
        </CommentsList>
      )}
    </CommentsContainer>
  );
}
