import { PROJECT_LIST, ADD_PROJECT, REMOVE_PROJECT } from '../constants';

export default function projects(state = {}, action) {
  switch (action.type) {
    case PROJECT_LIST:
      return {
        ...state,
        [action.payload.name]: action.payload.url,
      };
    case ADD_PROJECT:
      return Object.assign({}, state, {
        projects: [
          ...state.projects,
          {
            id: action.id,
            name: action.name,
            url: action.url,
            tags: action.tags,
            completed: false
          }
        ]
      });
    case REMOVE_PROJECT:
      return {
        ...state,
        [action.payload.id]: action.payload.url,
      };
    default:
      return state;
  }
}
