import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.scss';
import Link from '../Link';

function Navigation({ className }) {
  return (
    <div className={cx(s.root, className)} role="navigation">
      <Link className={s.link} to="/add">Add</Link>
      <span className={s.spacer}> | </span>
      <a href="https://github.com/reference-arch" className={s.link}>Code</a>
      <span className={s.spacer}> | </span>
      <Link className={s.link} to="/login">Log in</Link>
    </div>
  );
}

Navigation.propTypes = {
  className: PropTypes.string,
};

export default withStyles(s)(Navigation);
