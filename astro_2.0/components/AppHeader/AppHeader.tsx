import cn from 'classnames';
import React, { FC, useRef } from 'react';

import { Icon } from 'components/Icon';

import { SearchBar } from './components/SearchBar';
import { AccountButton } from './components/AccountButton';
import { NotificationsBell } from './components/NotificationsBell';

import styles from './AppHeader.module.scss';

export const AppHeader: FC = () => {
  const centralEl = useRef(null);

  function renderLogo(className?: string) {
    return (
      <a
        href="https://astrodao.com/"
        target="_blank"
        rel="noreferrer"
        className={cn(styles.logo, className)}
      >
        <Icon width={100} name="appLogo" />
      </a>
    );
  }

  return (
    <header className={styles.root}>
      {renderLogo()}
      <div className={styles.centralPart} ref={centralEl}>
        {renderLogo(styles.mobileLogo)}
        <SearchBar
          withSideBar
          placeholder="Search"
          parentElRef={centralEl}
          className={styles.search}
        />
      </div>
      <NotificationsBell className={styles.bell} notifications={[1, 2, 3]} />
      <AccountButton />
    </header>
  );
};
