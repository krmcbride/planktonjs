import ipaddr from 'ipaddr.js';
import { cloneDeep, isEmpty, isRegExp, isString } from 'lodash';
import { LoggerFactory } from '@krmcbride/plankton-logger';
import type AuthenticatedRequest from './model/authenticated-request';
import type Authentication from './model/authentication';

const LOG = LoggerFactory.getLogger('plankton.express.auth.accessExpressionContext');

/**
 * Expression sandbox for enforcing authorization rules which encapsulates
 * the current request.
 *
 * It is assumed that the user's authentication details are stored at
 * {@code req.auth}.
 *
 * @param {request} req The current request
 */
export default class AccessExpressionContext {
  private readonly authentication: Authentication;

  private readonly principal: string;

  private readonly authorities: string[];

  private readonly scopes: string[];

  private readonly ip: string;

  public readonly req: AuthenticatedRequest;

  constructor(req: AuthenticatedRequest) {
    this.authentication = cloneDeep(req.auth) || {};
    this.principal = this.authentication.user_name || '';
    this.authorities = this.authentication.authorities || [];
    this.scopes = this.authentication.scope || [];
    this.ip = req.ip;
    this.req = req;
  }

  /**
   * Compares the given ip address or CIDR range against the current request IP
   */
  hasIpAddress(ip: string): boolean {
    if (ipaddr.isValid(ip)) {
      return this.ip === ip;
    }
    try {
      return ipaddr.parse(this.ip).match(ipaddr.parseCIDR(ip));
    } catch (err) {
      LOG.error({ err }, 'Error comparing "%s" IP and "%s" CIDR', this.ip, ip);
      throw err;
    }
  }

  /**
   * Always fails
   */
  // eslint-disable-next-line class-methods-use-this
  denyAll(): boolean {
    return false;
  }

  /**
   * Always succeeds
   */
  // eslint-disable-next-line class-methods-use-this
  permitAll(): boolean {
    return true;
  }

  /**
   * Returns true if the request is authenticated
   */
  isAuthenticated(): boolean {
    return !isEmpty(this.authentication);
  }

  /**
   * Provides the name of the security principal (typically the username)
   */
  getPrincipal(): string {
    return this.principal;
  }

  /**
   * Provides the authentication object
   */
  getAuthentication(): Authentication {
    return this.authentication;
  }

  /**
   * Succeeds if any of the given authorities are granted
   */
  hasAnyAuthority(...authorities: string[]): boolean {
    return authorities.find((authority) => this.hasAuthority(authority)) !== undefined;
  }

  /**
   * Succeeds if any of the given roles are granted
   */
  hasAnyRole(...roles: string[]): boolean {
    return roles.find((role) => this.hasRole(role)) !== undefined;
  }

  /**
   * Succeeds if any of the given scopes are granted
   */
  hasAnyScope(...scopes: string[]): boolean {
    return scopes.find((scope) => this.hasScope(scope)) !== undefined;
  }

  /**
   * Succeeds if any of the given scopes are granted
   */
  hasAnyScopeMatching(...scopeRegexps: (string | RegExp)[]): boolean {
    return scopeRegexps.find((scopeRegexp) => this.hasScopeMatching(scopeRegexp)) !== undefined;
  }

  /**
   * Returns true if the current token has the given scope
   */
  hasScope(scope: string): boolean {
    if (!isString(scope)) {
      return false;
    }
    const retVal = this.scopes.find((s) => s.toLowerCase() === scope.toLowerCase()) !== undefined;
    LOG.debug('%s %s granted scope %s', this.principal, retVal ? 'is' : 'is not', scope);
    return retVal;
  }

  /**
   * Returns true if the current token has the given scope
   */
  hasScopeMatching(scopeRegexp: string | RegExp): boolean {
    if (!isString(scopeRegexp) && !isRegExp(scopeRegexp)) {
      return false;
    }
    const retVal = this.scopes.find((s) => s.match(scopeRegexp) !== null) !== undefined;
    LOG.debug(
      '%s %s scope matching %s',
      this.principal,
      retVal ? 'has' : "doesn't have",
      scopeRegexp,
    );
    return retVal;
  }

  /**
   * Returns true if the current token has the given authority
   */
  hasAuthority(authority: string): boolean {
    if (!isString(authority)) {
      return false;
    }
    const retVal =
      this.authorities.find((a) => a.toLowerCase() === authority.toLowerCase()) !== undefined;
    LOG.debug('%s %s granted authority %s', this.principal, retVal ? 'is' : 'is not', authority);
    return retVal;
  }

  /**
   * Returns true if the current token has the given role.
   * This is just a shorthand for hasAuthority which allows the "ROLE_" prefix to be omitted.
   */
  hasRole(role: string): boolean {
    if (!isString(role)) {
      return false;
    }
    const retVal = this.hasAuthority(
      role.toUpperCase().match(/^ROLE_/) === null ? `ROLE_${role}` : role,
    );
    LOG.debug('%s %s granted role %s', this.principal, retVal ? 'is' : 'is not', role);
    return retVal;
  }
}
