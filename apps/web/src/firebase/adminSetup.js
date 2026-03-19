const disabledMessage =
  'Client-side admin elevation is disabled. Assign admin roles through secure server-side tooling.';

export const setUserAsAdmin = async () => {
  console.error(disabledMessage);
  return false;
};

export const ensureAdminUser = async () => {
  console.error(disabledMessage);
  return false;
};
