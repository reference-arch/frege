import { PROJECT_LIST, ADD_PROJECT, REMOVE_PROJECT } from '../constants';

export function setProjectList({ name, html_url, description, tags }) {
  return {
    type: PROJECT_LIST,
    payload: {
      name,
      html_url,
      description,
      tags,
    },
  };
}

export function addProject({ id, name, html_url, description, tags }) {
  return {
    type: ADD_PROJECT,
    payload: {
      id,
      name,
      html_url,
      description,
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
