/* eslint-disable consistent-return */
import fs from 'fs-extra';
import path from 'path';
import { constants } from '../../../tools';

import { getFiles, existsMustBeDir, loadJSON, sanitize } from '../../../utils';
import log from '../../../logger';
import { DirectoryHandler } from '.';
import DirectoryContext from '..';
import { Asset, ParsedAsset } from '../../../types';

type ParsedActions = ParsedAsset<'actions', Asset[]>;

function parse(context: DirectoryContext): ParsedActions {
  const actionsFolder = path.join(context.filePath, constants.ACTIONS_DIRECTORY);
  if (!existsMustBeDir(actionsFolder)) return { actions: null }; // Skip
  const files = getFiles(actionsFolder, ['.json']);
  const actions = files.map((file) => {
    const action = { ...loadJSON(file, context.mappings) };
    const actionFolder = path.join(constants.ACTIONS_DIRECTORY, `${action.name}`);
    if (action.code) {
      action.code = context.loadFile(action.code, actionFolder);
    }
    return action;
  });
  return {
    actions,
  };
}

function mapSecrets(secrets) {
  if (secrets && secrets.length > 0) {
    return secrets.map((secret) => ({ name: secret.name, value: secret.value }));
  }
  return [];
}

function mapActionCode(filePath, action) {
  const { code } = action;

  if (!code) {
    return '';
  }

  const actionName = sanitize(action.name);
  const actionFolder = path.join(filePath, constants.ACTIONS_DIRECTORY, `${actionName}`);
  fs.ensureDirSync(actionFolder);

  const codeFile = path.join(actionFolder, 'code.js');
  log.info(`Writing ${codeFile}`);
  fs.writeFileSync(codeFile, code);

  return `${codeFile}`;
}

function mapToAction(filePath, action) {
  return {
    name: action.name,
    code: mapActionCode(filePath, action),
    runtime: action.runtime,
    status: action.status,
    dependencies: action.dependencies,
    secrets: mapSecrets(action.secrets),
    supported_triggers: action.supported_triggers,
    deployed: action.deployed || action.all_changes_deployed,
  };
}

async function dump(context: DirectoryContext): Promise<void> {
  const { actions } = context.assets;
  if (!actions) return;

  // Create Actions folder
  const actionsFolder = path.join(context.filePath, constants.ACTIONS_DIRECTORY);
  fs.ensureDirSync(actionsFolder);
  actions.forEach((action) => {
    // Dump template metadata
    const name = sanitize(action.name);
    const actionFile = path.join(actionsFolder, `${name}.json`);
    log.info(`Writing ${actionFile}`);
    fs.writeFileSync(actionFile, JSON.stringify(mapToAction(context.filePath, action), null, 2));
  });
}

const actionsHandler: DirectoryHandler<ParsedActions> = {
  parse,
  dump,
};

export default actionsHandler;
