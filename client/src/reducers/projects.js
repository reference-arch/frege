import { PROJECT_LIST, ADD_PROJECT, REMOVE_PROJECT } from '../constants';

export default function projects(state = {projects:[]}, action) {
  switch (action.type) {
    case PROJECT_LIST:
      return {
        ...state,
        [action.payload.name]: action.payload.html_url,
      };
    case ADD_PROJECT:
      return Object.assign({projects:[]}, state, {
        projects: [
          ...state.projects,
          {
            id: action.payload.id,
            github_id: action.payload.id,
            name: action.payload.name,
            html_url: action.payload.html_url,
            tags: action.payload.tags,
            completed: false
          }
        ]
      });
    case REMOVE_PROJECT:
      return {
        ...state,
        [action.payload.id]: action.payload.html_url,
      };
    default:
      return state;
  }
}
