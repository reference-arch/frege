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
              {(item.tags || []).map((tag, index) => (
                <span>
                  <a href={'/?tags='+tag}>{tag}</a>
                , </span>
              ))}
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
