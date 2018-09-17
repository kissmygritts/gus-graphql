import { ForbiddenError } from 'apollo-server'
import { skip } from 'graphql-resolvers'

export const isAuthenticated = (root, args, ctx, info) =>
  ctx.me ? skip : new ForbiddenError('Not authenticated as user')
