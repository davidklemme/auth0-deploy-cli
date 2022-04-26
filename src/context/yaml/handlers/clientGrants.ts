import { convertClientIdToName } from '../../../utils';
import { YAMLHandler } from '.';
import YAMLContext from '..';
import { Asset } from '../../../types';

type ParsedClientGrants = {
  clientGrants: Asset[] | null;
};

async function parse(context: YAMLContext): Promise<ParsedClientGrants> {
  const { clientGrants } = context.assets;

  if (!clientGrants) return { clientGrants: null };

  return {
    clientGrants,
  };
}

async function dump(context: YAMLContext): Promise<ParsedClientGrants> {
  const { clientGrants, clients } = context.assets;

  // Nothing to do
  if (!clientGrants) return { clientGrants: null };

  // Convert client_id to the client name for readability
  return {
    clientGrants: clientGrants.map((grant) => {
      const dumpGrant = { ...grant };
      dumpGrant.client_id = convertClientIdToName(dumpGrant.client_id, clients || []);
      return dumpGrant;
    }),
  };
}

const clientGrantsHandler: YAMLHandler<ParsedClientGrants> = {
  parse,
  dump,
};

export default clientGrantsHandler;
