import { PROJECT_LIST, ADD_PROJECT, REMOVE_PROJECT } from '../constants';

export function setProjectList({ name, html_url, description }) {
  return {
    type: PROJECT_LIST,
    payload: {
      name,
      html_url,
      description,
    },
  };
}

export function addProject({ id, name, url, tags }) {
  return {
    type: ADD_PROJECT,
    payload: {
      id,
      name,
      url,
      tags,
    },
  };
}

export function removeProject({ id }) {
  return {
    type: REMOVE_PROJECT,
    payload: {
      id,
    },
  };
}
