import { combineReducers } from 'redux';
import runtime from './runtime';
import projects from './projects';

export default combineReducers({
  runtime,
  projects,
});
