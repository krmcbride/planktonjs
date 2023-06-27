import AccessExpressionContext from './access-expression-context';

const req = {
  auth: {
    user_name: 'steve@gmail.com',
    scope: ['account:reset'],
    authorities: ['ROLE_ADMIN'],
  },
  ip: '192.168.3.23',
} as any;

const context = new AccessExpressionContext(req);

describe('support/access-expression-context', () => {
  describe('AccessExpressionContext', () => {
    describe('req', () => {
      it('exposes the raw request', () => {
        expect(context.req).toEqual(req);
      });
    });
    describe('permitAll', () => {
      it('always returns true', () => {
        expect(context.permitAll()).toBe(true);
        expect(new AccessExpressionContext({} as any).permitAll()).toBe(true);
      });
    });
    describe('denyAll', () => {
      it('always returns false', () => {
        expect(context.denyAll()).toBe(false);
      });
    });
    describe('isAuthenticated', () => {
      it('is true when there is a user', () => {
        expect(context.isAuthenticated()).toBe(true);
      });
      it('is false when there is not a user', () => {
        expect(new AccessExpressionContext({} as any).isAuthenticated()).toBe(false);
      });
    });
    describe('hasIpAddress', () => {
      it('filters by IP address', () => {
        expect(context.hasIpAddress('127.0.0.1')).toBe(false);
        expect(context.hasIpAddress('192.168.3.23')).toBe(true);
      });
      it('filters by CIDR range', () => {
        expect(context.hasIpAddress('192.168.3.0/24')).toBe(true);
        expect(context.hasIpAddress('192.168.3.0/30')).toBe(false);
      });
      it('throws an exception if the value is not a IP or CIDR range', () => {
        expect(() => context.hasIpAddress('foo')).toThrow(
          'ipaddr: the address has neither IPv6 nor IPv4 CIDR format',
        );
      });
    });
    describe('getPrincipal', () => {
      it('exposes the username', () => {
        expect(context.getPrincipal()).toEqual(req.auth.user_name);
      });
    });

    describe('web/getAuthentication', () => {
      it('exposes the token payload', () => {
        expect(context.getAuthentication()).toEqual(req.auth);
      });
    });
    describe('hasRole', () => {
      it('is true if the argument exactly matches an authority', () => {
        expect(context.hasRole('ROLE_ADMIN')).toBe(true);
      });
      it('is true if the argument exactly matches an authority with ROLE_ prefix added', () => {
        expect(context.hasRole('ADMIN')).toBe(true);
      });
      it('is false if the argument does not exactly match an authority with or without ROLE_ prefix', () => {
        expect(context.hasRole('ROLE_FOO')).toBe(false);
        expect(context.hasRole('ROLE_ADMIN ')).toBe(false);
        expect(context.hasRole('_ADMIN')).toBe(false);
      });
    });
    describe('hasAnyRole', () => {
      it('is true if at least one argument exactly matches an authority', () => {
        expect(context.hasAnyRole('ROLE_ADMIN', 'ROLE_FOO', 'ZOMG')).toBe(true);
      });

      it('is true if at least one argument exactly matches an authority with ROLE_ prefix added', () => {
        expect(context.hasAnyRole('FOO', 'ADMIN', 'ZOMG')).toBe(true);
      });

      it('is false if none of the arguments exactly match an authority with or without ROLE_ prefix', () => {
        expect(context.hasAnyRole('ROLE_FOO', 'ZOMG', 'ADMIN ', 'ROLE_ADMINS')).toBe(false);
      });

      it('is false if no arguments are given', () => {
        expect(context.hasAnyRole()).toBe(false);
      });
    });
    describe('web/hasAuthority', () => {
      it('is true if the argument exactly matches an authority', () => {
        expect(context.hasAuthority('ROLE_ADMIN')).toBe(true);
      });
      it('is false if the argument does not exactly match an authority', () => {
        expect(context.hasAuthority('ADMIN')).toBe(false);
      });
    });
    describe('hasAnyAuthority', () => {
      it('is true if at least one argument exactly matches an authority', () => {
        expect(context.hasAnyAuthority('ROLE_ADMIN', 'ROLE_FOO', 'ZOMG')).toBe(true);
      });
      it('is false if none of the arguments exactly matches an authority', () => {
        expect(context.hasAnyAuthority('ADMIN', 'ROLE_FOO', 'ZOMG')).toBe(false);
      });
      it('is false if no arguments are given', () => {
        expect(context.hasAnyAuthority()).toBe(false);
      });
    });
    describe('hasScope', () => {
      it('is true if the argument exactly matches a scope', () => {
        expect(context.hasScope('account:reset')).toBe(true);
      });
      it('is false if the argument does not exactly match a scope', () => {
        expect(context.hasScope('account')).toBe(false);
        expect(context.hasScope('account:reset ')).toBe(false);
      });
    });
    describe('hasAnyScope', () => {
      it('is true if at least one argument exactly matches a scope', () => {
        expect(context.hasAnyScope('account', 'account:reset', 'foo')).toBe(true);
      });
      it('is false if none of the arguments exactly match a scope', () => {
        expect(context.hasAnyScope('account', 'account:foo', 'foo')).toBe(false);
      });
      it('is false if no arguments are given', () => {
        expect(context.hasAnyScope()).toBe(false);
      });
    });
    describe('hasScopeMatching', () => {
      it('is true if the regex argument matches scope', () => {
        expect(context.hasScopeMatching('account:reset')).toBe(true);
        expect(context.hasScopeMatching(/account:*/)).toBe(true);
        expect(context.hasScopeMatching('account*')).toBe(true);
        expect(context.hasScopeMatching('reset')).toBe(true);
      });
      it('is false if the regex argument does not match a scope', () => {
        expect(context.hasScopeMatching(/foo:*/)).toBe(false);
        expect(context.hasScopeMatching('^reset')).toBe(false);
      });
    });
    describe('hasAnyScopeMatching', () => {
      it('is true if at least one regex argument matches a scope', () => {
        expect(context.hasAnyScopeMatching('account', 'account:reset', 'foo')).toBe(true);
        expect(context.hasAnyScopeMatching(/account:*/, 'foo')).toBe(true);
        expect(context.hasAnyScopeMatching(/foo:*/, 'account*')).toBe(true);
        expect(context.hasAnyScopeMatching('reset')).toBe(true);
      });
      it('is false if none of the regex arguments match a scope', () => {
        expect(context.hasAnyScopeMatching(/foo:*/, 'foo')).toBe(false);
        expect(context.hasAnyScopeMatching('^reset')).toBe(false);
      });
      it('is false if no arguments are given', () => {
        expect(context.hasAnyScopeMatching()).toBe(false);
      });
    });
  });
});
