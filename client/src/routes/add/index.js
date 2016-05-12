import React from 'react';
import AddProjects from './AddProjects';
import fetch from '../../core/fetch';

export default {

  path: '/add',

  async action() {
    const resp = await fetch('/graphql', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{github{id,name,html_url,description}}',
      }),
      credentials: 'include',
    });
    const { data } = await resp.json();
    if (!data || !data.github) throw new Error('Failed to load the projects list.');
    return <AddProjects github={data.github} />;
  },
};
