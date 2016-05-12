import React from 'react';
import Home from './Home';
import fetch from '../../core/fetch';

export default {

  path: '/',

  async action() {
    const resp = await fetch('/graphql', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{projects{id,name,html_url,description,tags}}',
      }),
      credentials: 'include',
    });
    const { data } = await resp.json();
    if (!data || !data.projects) throw new Error('Failed to load the projects list.');
    return <Home projects={data.projects} />;
  },

};
