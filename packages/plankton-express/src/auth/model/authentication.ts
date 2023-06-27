// Based on the Auth token claims
export default interface Authentication {
  user_name?: string;
  authorities?: string[];
  scope?: string[];
  account_email?: string;
  account_id?: number;
  account_uuid?: string;
  account_first_name?: string;
  account_last_name?: string;
  account_locale?: string;
}
