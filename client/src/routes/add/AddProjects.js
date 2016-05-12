import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './AddProjects.scss';
import { ADD_PROJECT, REMOVE_PROJECT } from '../../constants';
import fetch from '../../core/fetch';
import configureStore from '../../store/configureStore';
const store = configureStore({});

const title = 'Reference Architectures';

function AddProjects({ github }, context) {
  context.setTitle(title);
  context.clicker = function(item){
    return function(){
      item['github_id'] = item.id;
      // fetch('https://frege.herokuapp.com/projects', {
      //   method: 'POST',
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(item)
      // });
      store.dispatch({ type: ADD_PROJECT, payload: item })
    }
  };
  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1 className={s.title}>Add Projects from GitHub</h1>
        <table className={s.projects}>
         <tbody>
          {github.map((item, index) => (
            <tr key={index} className={s.projectItem}>
              <td><input type="checkbox" value={item.id} onClick={context.clicker(item)} /></td>
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

AddProjects.propTypes = {
  github: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    html_url: PropTypes.string.isRequired,
    description: PropTypes.string,
  })).isRequired,
};
AddProjects.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(AddProjects);
