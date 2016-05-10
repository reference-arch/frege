import { GraphQLList as List } from 'graphql';
import fetch from '../../core/fetch';
import ProjectItemType from '../types/ProjectItemType';
import { githubToken } from '../../config';

// GitHub
const url = 'https://'+githubToken+':x-oauth-basic@api.github.com/user/repos';

let items = [];
let lastFetchTask;
let lastFetchTime = new Date(1970, 0, 1);

const projects = {
  type: new List(ProjectItemType),
  resolve() {
    if (lastFetchTask) {
      return lastFetchTask;
    }

    if ((new Date() - lastFetchTime) > 1000 * 15 /* 15 sec */) {
      lastFetchTime = new Date();
      lastFetchTask = fetch(url)
        .then(response => {
          if( response.status !== 200 ) {
            throw new Error('Unexpected response status '+ response.status)
          }
          return response.json();
        })
        .then(data => {
          data.splice(data.findIndex(item => { 
            return item.name === 'reference-arch.github.io';
          }), 1);
          return items = data;
        })
        .finally(() => {
          lastFetchTask = null;
        });

      if (items.length) {
        return items;
      }

      return lastFetchTask;
    }

    return items;
  },
};

export default projects;
