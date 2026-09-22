import { SetMetadata } from '@nestjs/common'

export const REQUIRE_PRIVILEGE_KEY = 'requirePrivileges'

export const RequirePrivilege = (...privileges: string[]) =>
  SetMetadata(REQUIRE_PRIVILEGE_KEY, privileges)
