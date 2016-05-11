/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.scss';

const title = 'Reference Architectures';

function Home({ projects }, context) {
  context.setTitle(title);
  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1 className={s.title}>Projects</h1>
        <table className={s.projects}>
         <tbody>
          {projects.map((item, index) => (
            <tr key={index} className={s.projectItem}>
              <td><input type="checkbox" /></td>
              <td>{item.id}</td>
              <td>
              <a href={item.html_url} className={s.projectTitle}>{item.name}</a>
              </td>
              <td>
              <span
                className={s.projectDesc}
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
              </td>
              <td>
              {item.tags}
              </td>
            </tr>
          ))}
         </tbody>
        </table>
      </div>
    </div>
  );
}

Home.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    html_url: PropTypes.string.isRequired,
    description: PropTypes.string,
  })).isRequired,
};
Home.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Home);
