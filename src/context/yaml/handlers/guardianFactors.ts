import { YAMLHandler } from '.';
import YAMLContext from '..';
import { Asset } from '../../../types';

type ParsedGuardianFactors = {
  guardianFactors: Asset[] | null;
};

async function parseAndDump(context: YAMLContext): Promise<ParsedGuardianFactors> {
  const { guardianFactors } = context.assets;

  if (!guardianFactors) return { guardianFactors: null };

  return {
    guardianFactors,
  };
}

const guardianFactorsHandler: YAMLHandler<ParsedGuardianFactors> = {
  parse: parseAndDump,
  dump: parseAndDump,
};

export default guardianFactorsHandler;
